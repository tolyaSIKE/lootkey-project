using System.Text.Json;

namespace LootkeyAPI.Services
{
    public class UserActionLogger
    {
        private readonly IWebHostEnvironment _env;
        private static readonly SemaphoreSlim _lock = new(1, 1);

        public UserActionLogger(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task LogAsync(object logData)
        {
            var logsFolder = Path.Combine(_env.ContentRootPath, "Logs");

            if (!Directory.Exists(logsFolder))
                Directory.CreateDirectory(logsFolder);

            var fileName = $"actions-{DateTime.Now:yyyy-MM-dd}.log";
            var filePath = Path.Combine(logsFolder, fileName);

            var json = JsonSerializer.Serialize(logData, new JsonSerializerOptions
            {
                WriteIndented = false
            });

            await _lock.WaitAsync();

            try
            {
                await File.AppendAllTextAsync(filePath, json + Environment.NewLine);
            }
            finally
            {
                _lock.Release();
            }
        }
    }
}