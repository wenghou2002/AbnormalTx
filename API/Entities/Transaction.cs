namespace API.Entities
{
	public class Transaction
	{
        public int Id { get; set; }

        public long MSISDN { get; set; }

        public string Message { get; set; }

        public string BroadcastDate { get; set; }

        public string Country { get; set; }

    }
}
