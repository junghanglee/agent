using System;
using System.Diagnostics;
using System.IO;
using System.Text;

namespace InStepInstaller
{
    internal static class Program
    {
        private const string ProductName = "InStep";
        private const string ScriptResourceName = "InStepInstaller.Resources.install-hermes-mvp.ps1";

        [STAThread]
        private static int Main(string[] args)
        {
            Console.Title = "InStep - Hermes AI Agent Installer";
            Console.OutputEncoding = Encoding.UTF8;

            PrintHeader();

            string workRoot = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "InStep",
                "HermesInstaller"
            );
            Directory.CreateDirectory(workRoot);

            string scriptPath = Path.Combine(workRoot, "install-hermes-mvp.ps1");
            ExtractResource(ScriptResourceName, scriptPath);

            Console.WriteLine("Preparing unattended Hermes installation...");
            Console.WriteLine("Script: " + scriptPath);
            Console.WriteLine();

            string psArgs = "-NoProfile -ExecutionPolicy Bypass -File \"" + scriptPath + "\"";
            var startInfo = new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = psArgs,
                UseShellExecute = false,
                RedirectStandardOutput = false,
                RedirectStandardError = false,
                CreateNoWindow = false,
                WorkingDirectory = workRoot
            };

            try
            {
                using (var process = Process.Start(startInfo))
                {
                    if (process == null)
                    {
                        Console.Error.WriteLine("Failed to start PowerShell installer.");
                        return 1;
                    }

                    process.WaitForExit();
                    return process.ExitCode;
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("InStep installer failed to start.");
                Console.Error.WriteLine(ex.Message);
                return 1;
            }
        }

        private static void PrintHeader()
        {
            Console.WriteLine("============================================================");
            Console.WriteLine(" InStep - Hermes AI Agent One-Stop Installer");
            Console.WriteLine("============================================================");
            Console.WriteLine();
            Console.WriteLine("This installer completes the default Hermes installation without prompts.");
            Console.WriteLine("Logs are saved to Desktop\\Hermes-Installer-Logs.");
            Console.WriteLine();
        }

        private static void ExtractResource(string resourceName, string outputPath)
        {
            var assembly = typeof(Program).Assembly;
            using (Stream input = assembly.GetManifestResourceStream(resourceName))
            {
                if (input == null)
                {
                    string available = string.Join(", ", assembly.GetManifestResourceNames());
                    throw new InvalidOperationException("Embedded installer script not found. Available resources: " + available);
                }

                using (FileStream output = File.Create(outputPath))
                {
                    input.CopyTo(output);
                }
            }
        }
    }
}
