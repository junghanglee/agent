using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace AILinkerInstaller
{
    internal static class Program
    {
        [STAThread]
        private static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new InstallerWizard());
        }
    }

    internal sealed class InstallerWizard : Form
    {
        private const string ScriptResourceName = "AILinkerInstaller.Resources.install-hermes-mvp.ps1";
        private const string HermesBannerResourceName = "AILinkerInstaller.Resources.hermes-banner.png";
        private const string IconResourceName = "AILinkerInstaller.Resources.ai-linker.ico";

        private readonly Panel sidebar = new Panel();
        private readonly Panel rightHost = new Panel();
        private readonly Panel content = new Panel();
        private readonly Panel buttonBar = new Panel();
        private readonly FlowLayoutPanel buttonFlow = new FlowLayoutPanel();
        private readonly Button backButton = new Button();
        private readonly Button nextButton = new Button();
        private readonly Button cancelButton = new Button();
        private readonly Label titleLabel = new Label();
        private readonly Label stepLabel = new Label();
        private readonly Label bodyLabel = new Label();
        private readonly PictureBox hermesBanner = new PictureBox();
        private readonly ProgressBar progress = new ProgressBar();
        private readonly TextBox logBox = new TextBox();

        private int page = 0;
        private bool installing = false;
        private int installExitCode = -1;
        private string lastLogPath = "Desktop\\Hermes-Installer-Logs";

        public InstallerWizard()
        {
            Text = "AI Linker - Hermes AI Agent Setup Wizard";
            StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = true;
            AutoScaleMode = AutoScaleMode.Dpi;
            ClientSize = new Size(980, 640);
            MinimumSize = new Size(980, 640);
            Font = new Font("Segoe UI", 9F);
            BackColor = Color.White;

            try
            {
                using (Stream iconStream = GetType().Assembly.GetManifestResourceStream(IconResourceName))
                {
                    if (iconStream != null) Icon = new Icon(iconStream);
                }
            }
            catch { }

            sidebar.Dock = DockStyle.Left;
            sidebar.Width = 320;
            sidebar.Paint += SidebarPaint;
            Controls.Add(sidebar);

            rightHost.Dock = DockStyle.Fill;
            rightHost.BackColor = Color.White;
            Controls.Add(rightHost);

            buttonBar.Dock = DockStyle.Bottom;
            buttonBar.Height = 76;
            buttonBar.Padding = new Padding(24, 20, 24, 20);
            buttonBar.BackColor = Color.FromArgb(248, 249, 252);
            rightHost.Controls.Add(buttonBar);

            buttonFlow.Dock = DockStyle.Right;
            buttonFlow.FlowDirection = FlowDirection.LeftToRight;
            buttonFlow.WrapContents = false;
            buttonFlow.AutoSize = true;
            buttonBar.Controls.Add(buttonFlow);

            backButton.Text = "Back";
            backButton.Width = 96;
            backButton.Height = 34;
            backButton.Margin = new Padding(0, 0, 8, 0);
            backButton.Click += delegate { if (page > 0) { page--; RenderPage(); } };
            buttonFlow.Controls.Add(backButton);

            nextButton.Text = "Next";
            nextButton.Width = 116;
            nextButton.Height = 34;
            nextButton.Margin = new Padding(0, 0, 8, 0);
            nextButton.Click += NextButtonClick;
            buttonFlow.Controls.Add(nextButton);

            cancelButton.Text = "Cancel";
            cancelButton.Width = 88;
            cancelButton.Height = 34;
            cancelButton.Margin = new Padding(0);
            cancelButton.Click += delegate { if (!installing || ConfirmCancel()) Close(); };
            buttonFlow.Controls.Add(cancelButton);

            content.Dock = DockStyle.Fill;
            content.Padding = new Padding(48, 34, 48, 26);
            content.BackColor = Color.White;
            rightHost.Controls.Add(content);
            content.BringToFront();
            buttonBar.BringToFront();

            titleLabel.Dock = DockStyle.Top;
            titleLabel.Height = 58;
            titleLabel.Font = new Font("Segoe UI", 22F, FontStyle.Bold);
            titleLabel.ForeColor = Color.FromArgb(28, 30, 48);
            titleLabel.TextAlign = ContentAlignment.MiddleLeft;
            titleLabel.AutoEllipsis = true;
            content.Controls.Add(titleLabel);

            stepLabel.Dock = DockStyle.Top;
            stepLabel.Height = 34;
            stepLabel.Font = new Font("Segoe UI", 10F, FontStyle.Bold);
            stepLabel.ForeColor = Color.FromArgb(92, 79, 184);
            stepLabel.TextAlign = ContentAlignment.MiddleLeft;
            stepLabel.AutoEllipsis = true;
            content.Controls.Add(stepLabel);
            stepLabel.BringToFront();

            logBox.Dock = DockStyle.Bottom;
            logBox.Height = 198;
            logBox.Multiline = true;
            logBox.ScrollBars = ScrollBars.Vertical;
            logBox.ReadOnly = true;
            logBox.BackColor = Color.FromArgb(18, 20, 32);
            logBox.ForeColor = Color.FromArgb(225, 235, 255);
            logBox.BorderStyle = BorderStyle.FixedSingle;
            logBox.Font = new Font("Consolas", 8.5F);
            logBox.Visible = false;
            content.Controls.Add(logBox);

            progress.Dock = DockStyle.Bottom;
            progress.Height = 22;
            progress.Style = ProgressBarStyle.Marquee;
            progress.Visible = false;
            content.Controls.Add(progress);

            hermesBanner.Dock = DockStyle.Bottom;
            hermesBanner.Height = 94;
            hermesBanner.SizeMode = PictureBoxSizeMode.Zoom;
            hermesBanner.BackColor = Color.White;
            content.Controls.Add(hermesBanner);
            LoadHermesBanner();

            bodyLabel.Dock = DockStyle.Fill;
            bodyLabel.Font = new Font("Segoe UI", 11F);
            bodyLabel.ForeColor = Color.FromArgb(58, 62, 82);
            bodyLabel.TextAlign = ContentAlignment.TopLeft;
            bodyLabel.Padding = new Padding(0, 24, 0, 10);
            content.Controls.Add(bodyLabel);
            bodyLabel.BringToFront();

            RenderPage();
        }

        private void LoadHermesBanner()
        {
            try
            {
                using (Stream s = GetType().Assembly.GetManifestResourceStream(HermesBannerResourceName))
                {
                    if (s != null) hermesBanner.Image = Image.FromStream(s);
                }
            }
            catch { }
        }

        private void SidebarPaint(object sender, PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            Rectangle r = sidebar.ClientRectangle;
            using (LinearGradientBrush bg = new LinearGradientBrush(r, Color.FromArgb(14, 18, 38), Color.FromArgb(74, 45, 145), 45F))
            {
                g.FillRectangle(bg, r);
            }

            using (Font brand = new Font("Segoe UI", 25F, FontStyle.Bold))
            using (Font small = new Font("Segoe UI", 10F))
            using (Font cardTitle = new Font("Segoe UI", 10F, FontStyle.Bold))
            using (Font cardSub = new Font("Segoe UI", 8.5F))
            using (Brush white = new SolidBrush(Color.White))
            using (Brush muted = new SolidBrush(Color.FromArgb(212, 224, 255)))
            using (Brush cyan = new SolidBrush(Color.FromArgb(70, 230, 255)))
            using (Brush cardBrush = new SolidBrush(Color.FromArgb(38, 255, 255, 255)))
            using (Brush activeCardBrush = new SolidBrush(Color.FromArgb(58, 70, 230, 255)))
            using (Pen cardBorder = new Pen(Color.FromArgb(75, 255, 255, 255), 1F))
            {
                g.DrawString("AI Linker", brand, white, 28, 28);
                g.DrawString("Hermes AI Agent installer", small, muted, 31, 78);

                DrawStepCard(g, 1, "Create Agent", "Install Hermes runtime", 30, 140, 260, page >= 1, cardTitle, cardSub, white, muted, cyan, cardBrush, activeCardBrush, cardBorder);
                DrawStepCard(g, 2, "Connect Brain", "Apply LLM defaults", 30, 230, 260, page >= 2, cardTitle, cardSub, white, muted, cyan, cardBrush, activeCardBrush, cardBorder);
                DrawStepCard(g, 3, "Messenger Ready", "Check skills and gateway", 30, 320, 260, page >= 3, cardTitle, cardSub, white, muted, cyan, cardBrush, activeCardBrush, cardBorder);

                g.DrawString("Logs are saved to", small, muted, 30, Math.Max(500, sidebar.Height - 88));
                g.DrawString("Desktop\\Hermes-Installer-Logs", cardSub, white, 30, Math.Max(522, sidebar.Height - 66));
            }
        }

        private void DrawStepCard(Graphics g, int num, string title, string subtitle, int x, int y, int w, bool active, Font titleFont, Font subFont, Brush white, Brush muted, Brush cyan, Brush cardBrush, Brush activeCardBrush, Pen border)
        {
            RectangleF rect = new RectangleF(x, y, w, 64);
            using (GraphicsPath path = RoundedRect(rect, 16))
            {
                g.FillPath(active ? activeCardBrush : cardBrush, path);
                g.DrawPath(border, path);
            }

            using (Brush dark = new SolidBrush(Color.FromArgb(14, 18, 38)))
            using (Font numFont = new Font("Segoe UI", 10F, FontStyle.Bold))
            {
                g.FillEllipse(active ? cyan : new SolidBrush(Color.FromArgb(120, 255, 255, 255)), x + 16, y + 17, 30, 30);
                StringFormat sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center };
                g.DrawString(num.ToString(), numFont, active ? dark : white, new RectangleF(x + 16, y + 17, 30, 30), sf);
            }

            g.DrawString(title, titleFont, white, x + 58, y + 13);
            g.DrawString(subtitle, subFont, muted, x + 58, y + 35);
        }

        private GraphicsPath RoundedRect(RectangleF bounds, float radius)
        {
            float d = radius * 2;
            GraphicsPath path = new GraphicsPath();
            path.AddArc(bounds.X, bounds.Y, d, d, 180, 90);
            path.AddArc(bounds.Right - d, bounds.Y, d, d, 270, 90);
            path.AddArc(bounds.Right - d, bounds.Bottom - d, d, d, 0, 90);
            path.AddArc(bounds.X, bounds.Bottom - d, d, d, 90, 90);
            path.CloseFigure();
            return path;
        }

        private void RenderPage()
        {
            sidebar.Invalidate();
            backButton.Enabled = page > 0 && !installing;
            cancelButton.Enabled = !installing;
            progress.Visible = page == 3;
            logBox.Visible = page == 3;
            hermesBanner.Visible = page != 3;

            if (page == 0)
            {
                titleLabel.Text = "AI Linker Setup Wizard";
                stepLabel.Text = "One-stop Hermes AI Agent installation";
                bodyLabel.Text = "AI Linker prepares Hermes AI Agent automatically.\r\n\r\nFlow:\r\n1. Create Hermes AI Agent\r\n2. Connect the brain with safe LLM defaults\r\n3. Prepare messenger integrations and run diagnostics\r\n\r\nAPI keys, messenger logins, and OAuth secrets are not bundled. They remain optional post-install settings.";
                nextButton.Text = "Start";
            }
            else if (page == 1)
            {
                titleLabel.Text = "Step 1. Create Hermes AI Agent";
                stepLabel.Text = "Prepare prerequisites and the Hermes runtime";
                bodyLabel.Text = "AI Linker installs Hermes in the current Windows user environment.\r\n\r\nAutomatic tasks:\r\n- Check required tools such as Git, Python, and Node.js\r\n- Run the official Hermes installer in unattended mode\r\n- Verify the Hermes executable\r\n\r\nClick Next to review the LLM defaults.";
                nextButton.Text = "Next";
            }
            else if (page == 2)
            {
                titleLabel.Text = "Step 2. Connect the Brain";
                stepLabel.Text = "Apply safe default LLM settings";
                bodyLabel.Text = "Hermes is configured with safe defaults so it can be launched after installation.\r\n\r\nDefaults:\r\n- model.provider = auto\r\n- model.base_url = OpenRouter-compatible endpoint\r\n- model.default = anthropic/claude-opus-4.6\r\n\r\nUser API keys are not included in this installer.";
                nextButton.Text = "Install";
            }
            else if (page == 3)
            {
                titleLabel.Text = installing ? "Installing" : (installExitCode == 0 ? "Installation Complete" : "Installation Failed");
                stepLabel.Text = installing ? "Creating the agent, connecting defaults, and preparing integrations" : (installExitCode == 0 ? "AI Linker Hermes setup is complete" : "Please check the installer log");
                bodyLabel.Text = installing ? "Please wait. Installation may take several minutes depending on network speed.\r\n\r\nThe log window below shows live progress." : (installExitCode == 0 ? "Hermes base installation and diagnostics are complete.\r\n\r\nAPI keys and messenger integrations can be configured later." : "The installer did not finish successfully.\r\n\r\nLog location: " + lastLogPath);
                nextButton.Text = installExitCode == 0 ? "Finish" : "Close";
                nextButton.Enabled = !installing;
            }
        }

        private async void NextButtonClick(object sender, EventArgs e)
        {
            if (page == 0 || page == 1)
            {
                page++;
                RenderPage();
                return;
            }

            if (page == 2)
            {
                page = 3;
                RenderPage();
                await StartInstallAsync();
                return;
            }

            Close();
        }

        private async Task StartInstallAsync()
        {
            installing = true;
            installExitCode = -1;
            logBox.Clear();
            nextButton.Enabled = false;
            RenderPage();

            try
            {
                string workRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "AI Linker", "HermesInstaller");
                Directory.CreateDirectory(workRoot);
                string scriptPath = Path.Combine(workRoot, "install-hermes-mvp.ps1");
                ExtractResource(ScriptResourceName, scriptPath);
                AppendLog("AI Linker wizard started.");
                AppendLog("Installer script: " + scriptPath);

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = "powershell.exe";
                psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -File \"" + scriptPath + "\"";
                psi.WorkingDirectory = workRoot;
                psi.UseShellExecute = false;
                psi.RedirectStandardOutput = true;
                psi.RedirectStandardError = true;
                psi.CreateNoWindow = true;
                psi.StandardOutputEncoding = Encoding.UTF8;
                psi.StandardErrorEncoding = Encoding.UTF8;

                using (Process p = new Process())
                {
                    p.StartInfo = psi;
                    p.OutputDataReceived += delegate(object s, DataReceivedEventArgs ev) { if (ev.Data != null) AppendLog(ev.Data); };
                    p.ErrorDataReceived += delegate(object s, DataReceivedEventArgs ev) { if (ev.Data != null) AppendLog(ev.Data); };
                    p.Start();
                    p.BeginOutputReadLine();
                    p.BeginErrorReadLine();
                    await Task.Run(new Action(p.WaitForExit));
                    installExitCode = p.ExitCode;
                }
            }
            catch (Exception ex)
            {
                installExitCode = 1;
                AppendLog("ERROR: " + ex.Message);
            }
            finally
            {
                installing = false;
                RenderPage();
            }
        }

        private void AppendLog(string text)
        {
            if (InvokeRequired)
            {
                BeginInvoke(new Action<string>(AppendLog), text);
                return;
            }

            if (text.IndexOf("Hermes-Installer-Logs", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                lastLogPath = text.Trim();
            }

            logBox.AppendText(text + Environment.NewLine);
            if (text.IndexOf("Applying safe default", StringComparison.OrdinalIgnoreCase) >= 0 || text.IndexOf("model.default", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                stepLabel.Text = "Step 2 running: connecting LLM defaults";
                sidebar.Invalidate();
            }
            else if (text.IndexOf("gateway", StringComparison.OrdinalIgnoreCase) >= 0 || text.IndexOf("skills", StringComparison.OrdinalIgnoreCase) >= 0 || text.IndexOf("doctor", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                stepLabel.Text = "Step 3 running: preparing integrations and diagnostics";
                sidebar.Invalidate();
            }
            else if (text.IndexOf("Installing", StringComparison.OrdinalIgnoreCase) >= 0 || text.IndexOf("Hermes executable", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                stepLabel.Text = "Step 1 running: creating Hermes AI Agent";
                sidebar.Invalidate();
            }
        }

        private void ExtractResource(string resourceName, string outputPath)
        {
            using (Stream input = GetType().Assembly.GetManifestResourceStream(resourceName))
            {
                if (input == null) throw new InvalidOperationException("Embedded resource not found: " + resourceName);
                using (FileStream output = File.Create(outputPath)) input.CopyTo(output);
            }
        }

        private bool ConfirmCancel()
        {
            return MessageBox.Show("Installation is running. Cancel anyway?", "AI Linker", MessageBoxButtons.YesNo, MessageBoxIcon.Warning) == DialogResult.Yes;
        }
    }
}
