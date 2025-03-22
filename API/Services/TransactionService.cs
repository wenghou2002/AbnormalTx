using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using API.Entities;
using API.DTOs;
using AutoMapper;
using Microsoft.Extensions.Logging;
using API.Data;

namespace API.Services
{
    public class TransactionService
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<TransactionService> _logger;
        private readonly string[] dateTimeFormats = { "yyyy-MM-dd HH:mm:ss.fff", "yyyy-MM-dd HH:mm:ss:fff", "dd MMM yyyy HH:mm:ss:fff" };

        public TransactionService(DataContext context, IMapper mapper, ILogger<TransactionService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<List<TransactionDto>> GetTransactionsAsync()
        {
            _logger.LogInformation("Starting GetTransactionsAsync task.");
            var transactions = await _context.Transactions.ToListAsync();
            return _mapper.Map<List<TransactionDto>>(transactions);
        }

        public async Task<TransactionDto> GetTransactionByMsisdnAsync(long msisdn)
        {
            _logger.LogInformation($"Starting GetTransactionByMsisdnAsync task for MSISDN: {msisdn}.");
            var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.MSISDN == msisdn);
            return _mapper.Map<TransactionDto>(transaction);
        }

        public async Task<List<TransactionDto>> GetTransactionsByCountryAsync(string country)
        {
            _logger.LogInformation($"Starting GetTransactionsByCountryAsync task for country: {country}.");
            var transactions = await _context.Transactions.Where(t => t.Country == country).ToListAsync();
            return _mapper.Map<List<TransactionDto>>(transactions);
        }

        public async Task<List<TransactionDto>> GetDuplicateTransactionsAsync()
        {
            try
            {
                _logger.LogInformation("Starting GetDuplicateTransactionsAsync task.");

                // Get all transactions sorted by MSISDN and BroadcastDate
                var transactions = await _context.Transactions
                    .OrderBy(t => t.MSISDN)
                    .ThenBy(t => t.BroadcastDate)
                    .ToListAsync();

                // O(n) algorithm to find duplicates
                var duplicateTransactions = new HashSet<Transaction>();
                var msisdnGroups = new Dictionary<long, List<(Transaction transaction, DateTime parsedDate)>>();

                // First pass: Group by MSISDN - O(n)
                foreach (var transaction in transactions)
                {
                    if (TryParseDate(transaction.BroadcastDate, out var parsedDate))
                    {
                        if (!msisdnGroups.ContainsKey(transaction.MSISDN))
                        {
                            msisdnGroups[transaction.MSISDN] = new List<(Transaction, DateTime)>();
                        }
                        msisdnGroups[transaction.MSISDN].Add((transaction, parsedDate));
                    }
                    else
                    {
                        _logger.LogWarning($"Date parsing failed for transaction with MSISDN={transaction.MSISDN}, Date={transaction.BroadcastDate}");
                    }
                }

                // Second pass: Find duplicates within each MSISDN group - O(n) since each transaction is only processed once
                foreach (var group in msisdnGroups)
                {
                    if (group.Value.Count <= 1) continue;
                    
                    var sortedTransactions = group.Value.OrderBy(t => t.parsedDate).ToList();
                    
                    for (int i = 0; i < sortedTransactions.Count - 1; i++)
                    {
                        var current = sortedTransactions[i];
                        var next = sortedTransactions[i + 1];
                        
                        var timeDifference = (next.parsedDate - current.parsedDate).TotalSeconds;
                        
                        if (timeDifference <= 1)
                        {
                            _logger.LogInformation($"Duplicate found: MSISDN={group.Key}, TimeDifference={timeDifference}s");
                            duplicateTransactions.Add(current.transaction);
                            duplicateTransactions.Add(next.transaction);
                        }
                    }
                }

                return _mapper.Map<List<TransactionDto>>(duplicateTransactions.ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting duplicate transactions.");
                throw;
            }
        }

        private bool TryParseDate(string dateString, out DateTime date)
        {
            foreach (var format in dateTimeFormats)
            {
                if (DateTime.TryParseExact(dateString.Trim(), format, CultureInfo.InvariantCulture, DateTimeStyles.None, out date))
                {
                    return true;
                }
            }

            _logger.LogWarning($"Date parsing failed for: {dateString} using formats: {string.Join(", ", dateTimeFormats)}");
            date = default;
            return false;
        }

        public async Task<int> GenerateDummyTransactionsAsync(int count = 100)
        {
            try
            {
                _logger.LogInformation($"Generating {count} dummy transactions");
                
                var rnd = new Random();
                
                // Normal, benign messages
                var normalMessages = new[]
                {
                    "Your OTP is 123456",
                    "Thank you for your payment",
                    "Your account balance is $152.75",
                    "Your bill payment was successful",
                    "Appointment reminder for tomorrow",
                    "Your delivery will arrive today",
                    "Your transaction was completed",
                    "Your password has been updated",
                    "Welcome to our service",
                    "Thank you for your subscription"
                };
                
                // Suspicious, potentially abnormal messages
                var abnormalMessages = new[]
                {
                    "URGENT: Claim your prize now!",
                    "URGENT: Last chance to claim!",
                    "URGENT: Call this number now!",
                    "Your account has been compromised",
                    "Click this link to secure your account", 
                    "You've won a special prize",
                    "Verify your account now",
                    "Payment confirmation required",
                    "Your package is waiting for delivery",
                    "Final warning: Account suspension"
                };
                
                // Expanded country list
                var countries = new[] { 
                    "Philippines", 
                    "Malaysia", 
                    "Indonesia", 
                    "Thailand", 
                    "Singapore",
                    "Vietnam",
                    "Japan",
                    "South Korea",
                    "Australia",
                    "United States",
                    "India",
                    "China"
                };
                
                var now = DateTime.UtcNow;
                var transactions = new List<Transaction>();
                
                // Calculate how many abnormal transactions we need (1-10% of total)
                int abnormalCount = rnd.Next((int)(count * 0.01), (int)(count * 0.1) + 1);
                int normalCount = count - abnormalCount;
                
                _logger.LogInformation($"Generating {normalCount} normal transactions and {abnormalCount} abnormal transactions");

                // First create the normal transactions (non-duplicate, random times)
                for (int i = 0; i < normalCount; i++)
                {
                    // Generate completely random MSISDN (phone numbers)
                    // Random country code (63, 60, 62, etc.) + random numbers
                    int countryCode = 60 + rnd.Next(0, 20); // Various country codes
                    long msisdn = countryCode * 1000000000L + rnd.Next(100000000, 999999999);
                    
                    // Random time in the last 30 days
                    var daysOffset = rnd.Next(0, 30);
                    var hoursOffset = rnd.Next(0, 24);
                    var minutesOffset = rnd.Next(0, 60);
                    
                    var transaction = new Transaction
                    {
                        MSISDN = msisdn,
                        Message = normalMessages[rnd.Next(normalMessages.Length)],
                        BroadcastDate = now.AddDays(-daysOffset).AddHours(-hoursOffset).AddMinutes(-minutesOffset).ToString("yyyy-MM-dd HH:mm:ss.fff"),
                        Country = countries[rnd.Next(countries.Length)]
                    };
                    
                    transactions.Add(transaction);
                }
                
                // Now create the abnormal transactions (duplicates with similar timestamps)
                if (abnormalCount > 0)
                {
                    // Generate a few MSISDNs that will be used for abnormal patterns
                    var abnormalMsisdns = new List<long>();
                    int abnormalMsisdnCount = Math.Min(5, abnormalCount / 2); // No more than 5 different numbers for abnormal transactions
                    
                    for (int i = 0; i < abnormalMsisdnCount; i++) 
                    {
                        int countryCode = 60 + rnd.Next(0, 20);
                        abnormalMsisdns.Add(countryCode * 1000000000L + rnd.Next(100000000, 999999999));
                    }
                    
                    for (int i = 0; i < abnormalCount; i++)
                    {
                        // Use one of our abnormal MSISDNs
                        long msisdn = abnormalMsisdns[rnd.Next(abnormalMsisdns.Count)];
                        
                        // Use very close timestamps (within 1 second) for the same MSISDN
                        // This will trigger the duplicate detection in GetDuplicateTransactionsAsync
                        var secondsOffset = rnd.Next(0, 1); // 0 or 1 second difference
                        var millisOffset = rnd.Next(0, 999);
                        
                        var transaction = new Transaction
                        {
                            MSISDN = msisdn,
                            Message = abnormalMessages[rnd.Next(abnormalMessages.Length)],
                            BroadcastDate = now.AddSeconds(-secondsOffset).AddMilliseconds(-millisOffset).ToString("yyyy-MM-dd HH:mm:ss.fff"),
                            Country = countries[rnd.Next(countries.Length)]
                        };
                        
                        transactions.Add(transaction);
                    }
                }
                
                // Add transactions to database
                await _context.Transactions.AddRangeAsync(transactions);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Successfully added {transactions.Count} transactions with {abnormalCount} abnormal patterns");
                return transactions.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating dummy transactions");
                throw;
            }
        }
    }
}
