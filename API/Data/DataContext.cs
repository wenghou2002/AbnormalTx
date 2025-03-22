using System.Transactions;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions options) : base(options)
        {

        }

        public DbSet<AppUser> Users { get; set; }
        public DbSet<Entities.Transaction> Transactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Transaction entity
            modelBuilder.Entity<Entities.Transaction>(entity =>
            {
                // Use Id as the key with auto-increment
                entity.HasKey(t => t.Id);
                entity.Property(t => t.Id).ValueGeneratedOnAdd();
                
                // Configure other properties
                entity.Property(t => t.MSISDN).IsRequired();
                entity.Property(t => t.Message).IsRequired();
                entity.Property(t => t.BroadcastDate).IsRequired();
                entity.Property(t => t.Country).IsRequired();
            });
        }
    }
}