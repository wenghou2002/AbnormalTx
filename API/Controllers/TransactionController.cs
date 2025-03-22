// API/Controllers/TransactionController.cs
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using API.Services;
using API.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionController : BaseApiController
    {
        private readonly TransactionService _transactionService;

        public TransactionController(TransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet("duplicates")]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> GetDuplicateTransactions()
        {
            var duplicateTransactions = await _transactionService.GetDuplicateTransactionsAsync();
            return Ok(duplicateTransactions);
        }

        [HttpPost("generate-dummy")]
        [Authorize]
        public async Task<ActionResult<int>> GenerateDummyTransactions([FromQuery] int count = 100)
        {
            if (count <= 0 || count > 500)
            {
                return BadRequest("Count must be between 1 and 500");
            }

            var generatedCount = await _transactionService.GenerateDummyTransactionsAsync(count);
            return Ok(new { message = $"Successfully generated {generatedCount} dummy transactions" });
        }
    }
}
