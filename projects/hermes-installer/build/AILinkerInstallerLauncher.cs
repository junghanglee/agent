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

        private readonly TableLayoutPanel root = new TableLayoutPanel();
        private readonly GradientPanel sidebar = new GradientPanel();
        private readonly TableLayoutPanel right = new TableLayoutPanel();
        private readonly Panel content = new Panel();
        private readonly FlowLayoutPanel buttonBar = new FlowLayoutPanel();

        private readonly StepCard[] stepCards = new StepCard[6];
        private readonly Label brandTitle = new Label();
        private readonly Label brandSub = new Label();
        private readonly Label logHint = new Label();

        private readonly Label titleLabel = new Label();
        private readonly Label subtitleLabel = new Label();
        private readonly Label bodyLabel = new Label();
        private readonly Panel heroCard = new Panel();
        private readonly Label heroIcon = new Label();
        private readonly Label heroText = new Label();
        private readonly PictureBox hermesBanner = new PictureBox();
        private readonly ComboBox llmCombo = new ComboBox();
        private readonly TextBox installCodeBox = new TextBox();
        private readonly Button manualButton = new Button();
        private readonly Button consoleButton = new Button();
        private readonly Button paymentButton = new Button();
        private readonly Button backButton = new Button();
        private readonly Button nextButton = new Button();
        private readonly Button cancelButton = new Button();
        private readonly ProgressBar progress = new ProgressBar();
        private readonly TextBox logBox = new TextBox();
        private readonly Label liveStatus = new Label();

        private int page = 0;
        private int runtimeStage = 0;
        private bool installing = false;
        private int installExitCode = -1;
        private string lastLogPath = "Desktop\\Hermes-Installer-Logs";

        private readonly string[] stageTitles = new string[]
        {
            "Start",
            "Create Agent",
            "LLM Brain",
            "Access Code",
            "Install",
            "AI Linker Console"
        };

        private readonly string[] stageSubtitles = new string[]
        {
            "Overview",
            "Hermes runtime",
            "Choose model",
            "Credit / approval",
            "Live progress",
            "Tokens / usage"
        };

        public InstallerWizard()
        {
            Text = "AI Linker - Hermes AI Agent Setup Wizard";
            StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = true;
            AutoScaleMode = AutoScaleMode.Dpi;
            ClientSize = new Size(1120, 720);
            MinimumSize = new Size(1120, 720);
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

            BuildLayout();
            LoadHermesBanner();
            RenderPage();
        }

        private void BuildLayout()
        {
            root.Dock = DockStyle.Fill;
            root.ColumnCount = 2;
            root.RowCount = 1;
            root.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 330F));
            root.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));
            Controls.Add(root);

            sidebar.Dock = DockStyle.Fill;
            sidebar.Padding = new Padding(26, 28, 26, 22);
            root.Controls.Add(sidebar, 0, 0);

            right.Dock = DockStyle.Fill;
            right.ColumnCount = 1;
            right.RowCount = 2;
            right.RowStyles.Add(new RowStyle(SizeType.Percent, 100F));
            right.RowStyles.Add(new RowStyle(SizeType.Absolute, 78F));
            root.Controls.Add(right, 1, 0);

            content.Dock = DockStyle.Fill;
            content.BackColor = Color.FromArgb(250, 251, 255);
            content.Padding = new Padding(38, 28, 38, 22);
            right.Controls.Add(content, 0, 0);

            buttonBar.Dock = DockStyle.Fill;
            buttonBar.FlowDirection = FlowDirection.RightToLeft;
            buttonBar.WrapContents = false;
            buttonBar.Padding = new Padding(18, 20, 26, 18);
            buttonBar.BackColor = Color.White;
            right.Controls.Add(buttonBar, 0, 1);

            ConfigureSidebar();
            ConfigureButtons();
            ConfigureReusableControls();
        }

        private void ConfigureSidebar()
        {
            brandTitle.Text = "AI Linker";
            brandTitle.Font = new Font("Segoe UI", 27F, FontStyle.Bold);
            brandTitle.ForeColor = Color.White;
            brandTitle.BackColor = Color.Transparent;
            brandTitle.SetBounds(28, 30, 270, 46);
            sidebar.Controls.Add(brandTitle);

            brandSub.Text = "Hermes AI Agent installer";
            brandSub.Font = new Font("Segoe UI", 10F);
            brandSub.ForeColor = Color.FromArgb(220, 230, 255);
            brandSub.BackColor = Color.Transparent;
            brandSub.SetBounds(31, 78, 260, 24);
            sidebar.Controls.Add(brandSub);

            int y = 134;
            for (int i = 0; i < stepCards.Length; i++)
            {
                stepCards[i] = new StepCard(i + 1, stageTitles[i], stageSubtitles[i]);
                stepCards[i].SetBounds(24, y, 282, 62);
                sidebar.Controls.Add(stepCards[i]);
                y += 72;
            }

            logHint.Text = "Live logs and manual are available inside the wizard.";
            logHint.Font = new Font("Segoe UI", 8.5F);
            logHint.ForeColor = Color.FromArgb(215, 225, 255);
            logHint.BackColor = Color.Transparent;
            logHint.SetBounds(28, 632, 270, 42);
            sidebar.Controls.Add(logHint);
        }

        private void ConfigureButtons()
        {
            cancelButton.Text = "Cancel";
            cancelButton.Width = 96;
            cancelButton.Height = 36;
            cancelButton.Margin = new Padding(8, 0, 0, 0);
            cancelButton.Click += delegate { if (!installing || ConfirmCancel()) Close(); };
            buttonBar.Controls.Add(cancelButton);

            nextButton.Text = "Next";
            nextButton.Width = 132;
            nextButton.Height = 36;
            nextButton.Margin = new Padding(8, 0, 0, 0);
            nextButton.Click += NextButtonClick;
            buttonBar.Controls.Add(nextButton);

            backButton.Text = "Back";
            backButton.Width = 96;
            backButton.Height = 36;
            backButton.Margin = new Padding(8, 0, 0, 0);
            backButton.Click += delegate { if (page > 0) { page--; RenderPage(); } };
            buttonBar.Controls.Add(backButton);

            manualButton.Text = "Open Manual";
            manualButton.Width = 124;
            manualButton.Height = 36;
            manualButton.Margin = new Padding(8, 0, 0, 0);
            manualButton.Click += delegate { OpenManual(); };
            buttonBar.Controls.Add(manualButton);
        }

        private void ConfigureReusableControls()
        {
            titleLabel.Font = new Font("Segoe UI", 24F, FontStyle.Bold);
            titleLabel.ForeColor = Color.FromArgb(22, 26, 44);
            titleLabel.AutoEllipsis = true;

            subtitleLabel.Font = new Font("Segoe UI", 10.5F, FontStyle.Bold);
            subtitleLabel.ForeColor = Color.FromArgb(85, 74, 170);
            subtitleLabel.AutoEllipsis = true;

            bodyLabel.Font = new Font("Segoe UI", 10.5F);
            bodyLabel.ForeColor = Color.FromArgb(56, 62, 84);
            bodyLabel.BackColor = Color.White;

            heroCard.BackColor = Color.White;
            heroCard.Paint += HeroCardPaint;

            heroIcon.Font = new Font("Segoe UI", 24F, FontStyle.Bold);
            heroIcon.ForeColor = Color.FromArgb(70, 78, 190);
            heroIcon.TextAlign = ContentAlignment.MiddleCenter;

            heroText.Font = new Font("Segoe UI", 10F);
            heroText.ForeColor = Color.FromArgb(58, 62, 82);

            hermesBanner.SizeMode = PictureBoxSizeMode.Zoom;
            hermesBanner.BackColor = Color.White;

            llmCombo.DropDownStyle = ComboBoxStyle.DropDownList;
            llmCombo.Font = new Font("Segoe UI", 10F);
            llmCombo.Items.Add("Recommended: Claude Opus 4.6 via OpenRouter");
            llmCombo.Items.Add("Claude Sonnet via OpenRouter");
            llmCombo.Items.Add("GPT compatible model via OpenRouter");
            llmCombo.Items.Add("Manual configuration after install");
            llmCombo.SelectedIndex = 0;

            installCodeBox.Font = new Font("Consolas", 10F, FontStyle.Bold);
            installCodeBox.ReadOnly = true;
            installCodeBox.Text = "AILINKER-HERMES-MVP-AUTO";

            progress.Style = ProgressBarStyle.Marquee;
            progress.MarqueeAnimationSpeed = 34;

            liveStatus.Font = new Font("Segoe UI", 10F, FontStyle.Bold);
            liveStatus.ForeColor = Color.FromArgb(74, 64, 170);
            liveStatus.Text = "Waiting to start";

            logBox.Multiline = true;
            logBox.ScrollBars = ScrollBars.Vertical;
            logBox.ReadOnly = true;
            logBox.BackColor = Color.FromArgb(16, 19, 32);
            logBox.ForeColor = Color.FromArgb(230, 238, 255);
            logBox.BorderStyle = BorderStyle.FixedSingle;
            logBox.Font = new Font("Consolas", 8.5F);

            consoleButton.Text = "Open AI Linker Console Preview";
            consoleButton.Width = 230;
            consoleButton.Height = 38;
            consoleButton.Click += delegate { OpenConsolePreview(); };

            paymentButton.Text = "Payment / Credit Flow Preview";
            paymentButton.Width = 220;
            paymentButton.Height = 38;
            paymentButton.Click += delegate { OpenPaymentPreview(); };
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

        private void RenderPage()
        {
            runtimeStage = installing ? Math.Max(runtimeStage, 3) : page;
            for (int i = 0; i < stepCards.Length; i++) stepCards[i].SetState(i == runtimeStage, i < runtimeStage);

            backButton.Enabled = page > 0 && !installing;
            cancelButton.Enabled = !installing;
            manualButton.Enabled = !installing;

            content.SuspendLayout();
            content.Controls.Clear();

            AddHeader(stageTitles[Math.Min(page, stageTitles.Length - 1)]);

            if (page == 0) RenderWelcome();
            else if (page == 1) RenderAgentStep();
            else if (page == 2) RenderLlmStep();
            else if (page == 3) RenderAccessStep();
            else if (page == 4) RenderInstallStep();
            else RenderConsoleStep();

            content.ResumeLayout();
        }

        private void AddHeader(string stage)
        {
            titleLabel.Text = page == 5 ? "AI Linker Console" : "AI Linker Hermes Setup";
            subtitleLabel.Text = "Current stage: " + stage;
            titleLabel.SetBounds(38, 24, 680, 48);
            subtitleLabel.SetBounds(40, 76, 680, 28);
            content.Controls.Add(titleLabel);
            content.Controls.Add(subtitleLabel);
        }

        private void RenderWelcome()
        {
            heroIcon.Text = "01";
            heroText.Text = "Welcome to AI Linker. This wizard prepares Hermes AI Agent, applies safe LLM defaults, and opens the path to paid credit / gateway features.";
            AddHeroCard(40, 122, 670, 96);
            AddBody("What this installer does:\r\n\r\n- Downloads and runs the official Hermes installer safely.\r\n- Shows every install stage and live log message.\r\n- Lets the user choose the default LLM profile.\r\n- Auto-fills an install code for later admin approval.\r\n- Prepares the AI Linker Console preview for tokens, credits, usage, recharge, and LLM changes.\r\n\r\nActual billing, $10 credit activation, token deduction, and multi-account LLM gateway require the AI Linker server backend.", 40, 244, 670, 230);
            AddBanner(40, 500, 670, 90);
            nextButton.Text = "Start";
        }

        private void RenderAgentStep()
        {
            heroIcon.Text = "02";
            heroText.Text = "Hermes runtime creation. AI Linker checks the Windows environment, downloads the official Hermes installer, and verifies the executable.";
            AddHeroCard(40, 122, 670, 96);
            AddBody("Detailed stage manual:\r\n\r\n1. Check internet connection to GitHub.\r\n2. Download the official Hermes install script.\r\n3. Run Hermes installer with SkipSetup so the process does not stop on prompts.\r\n4. Refresh PATH and locate hermes.exe.\r\n5. Verify Hermes version.\r\n\r\nThe live install screen will show download, extraction, installation, configuration, skill check, and doctor messages in real time.", 40, 244, 670, 250);
            AddBanner(40, 514, 670, 78);
            nextButton.Text = "Next";
        }

        private void RenderLlmStep()
        {
            heroIcon.Text = "03";
            heroText.Text = "Choose the first LLM profile. The installer applies a safe default, and AI Linker can later route requests through a managed gateway.";
            AddHeroCard(40, 122, 670, 96);
            AddBody("LLM selection:\r\n\r\nThe MVP configures Hermes with an OpenRouter-compatible default. In the future, the AI Linker gateway can hold multiple provider accounts and split paid usage across customers.", 40, 244, 670, 110);
            AddLabeledControl("Default LLM profile", llmCombo, 40, 380, 670, 34);
            AddBody("Payment note:\r\nInstallation can finish before payment, but AI Linker-managed execution should be blocked until payment/admin approval. After approval, a basic $10 credit can be granted by the server.", 40, 438, 670, 100);
            nextButton.Text = "Next";
        }

        private void RenderAccessStep()
        {
            heroIcon.Text = "04";
            heroText.Text = "Install code is auto-filled. Later, this code can be submitted to the AI Linker admin page for payment confirmation and credit approval.";
            AddHeroCard(40, 122, 670, 96);
            AddBody("Access / payment design:\r\n\r\n- Installer continues and completes local Hermes installation.\r\n- AI Linker Console remains in pending state until server approval.\r\n- When payment is approved, the server grants the initial $10 credit.\r\n- After credit is consumed, the console routes the user to recharge.\r\n\r\nThis screen prepares the UX. Real enforcement requires backend license validation.", 40, 244, 670, 160);
            AddLabeledControl("Auto install code", installCodeBox, 40, 430, 360, 34);
            paymentButton.SetBounds(420, 430, 240, 38);
            content.Controls.Add(paymentButton);
            nextButton.Text = "Install";
        }

        private void RenderInstallStep()
        {
            titleLabel.Text = installing ? "Installing Hermes" : (installExitCode == 0 ? "Installation Complete" : (installExitCode < 0 ? "Ready to Install" : "Installation Failed"));
            subtitleLabel.Text = installing ? "Live download, extraction, install, config, and diagnostic messages" : "Review the live log below";

            liveStatus.SetBounds(40, 116, 670, 28);
            content.Controls.Add(liveStatus);

            progress.SetBounds(40, 150, 670, 20);
            progress.Visible = installing;
            content.Controls.Add(progress);

            logBox.SetBounds(40, 188, 670, 350);
            content.Controls.Add(logBox);

            AddBody("The left stage cards are synchronized with the real installer output. If a step fails, share the log from Desktop\\Hermes-Installer-Logs.", 40, 552, 670, 44);
            nextButton.Text = installing ? "Installing..." : (installExitCode == 0 ? "Open Console" : (installExitCode < 0 ? "Run Install" : "Close"));
            nextButton.Enabled = !installing;
        }

        private void RenderConsoleStep()
        {
            heroIcon.Text = "06";
            heroText.Text = "AI Linker Console preview. This is the future control page for Hermes launch, token balance, credit recharge, LLM switching, usage statistics, and gateway account routing.";
            AddHeroCard(40, 122, 670, 96);
            AddBody("Console functions to build next:\r\n\r\n- Launch Hermes\r\n- Check token and money balance\r\n- View usage statistics\r\n- Recharge credits\r\n- Change LLM model\r\n- Connect messenger gateways\r\n- Use AI Linker managed LLM gateway with multiple provider accounts\r\n\r\nCurrent status: local UI preview only. Server, payment, license, and token accounting are required for production.", 40, 244, 670, 210);
            consoleButton.SetBounds(40, 486, 250, 38);
            paymentButton.SetBounds(304, 486, 240, 38);
            content.Controls.Add(consoleButton);
            content.Controls.Add(paymentButton);
            nextButton.Text = "Finish";
            nextButton.Enabled = true;
        }

        private void AddHeroCard(int x, int y, int w, int h)
        {
            heroCard.SetBounds(x, y, w, h);
            heroIcon.SetBounds(22, 22, 58, 52);
            heroText.SetBounds(96, 20, w - 125, h - 34);
            heroCard.Controls.Clear();
            heroCard.Controls.Add(heroIcon);
            heroCard.Controls.Add(heroText);
            content.Controls.Add(heroCard);
        }

        private void AddBody(string text, int x, int y, int w, int h)
        {
            Label label = new Label();
            label.Text = text;
            label.Font = new Font("Segoe UI", 10.2F);
            label.ForeColor = Color.FromArgb(55, 61, 82);
            label.BackColor = Color.White;
            label.Padding = new Padding(18, 14, 18, 14);
            label.SetBounds(x, y, w, h);
            label.Paint += BodyCardPaint;
            content.Controls.Add(label);
        }

        private void AddBanner(int x, int y, int w, int h)
        {
            hermesBanner.SetBounds(x, y, w, h);
            content.Controls.Add(hermesBanner);
        }

        private void AddLabeledControl(string caption, Control control, int x, int y, int w, int h)
        {
            Label label = new Label();
            label.Text = caption;
            label.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
            label.ForeColor = Color.FromArgb(70, 76, 100);
            label.SetBounds(x, y - 24, w, 20);
            content.Controls.Add(label);
            control.SetBounds(x, y, w, h);
            content.Controls.Add(control);
        }

        private void HeroCardPaint(object sender, PaintEventArgs e)
        {
            DrawRoundedPanel(e.Graphics, heroCard.ClientRectangle, Color.White, Color.FromArgb(220, 224, 248));
        }

        private void BodyCardPaint(object sender, PaintEventArgs e)
        {
            Control c = (Control)sender;
            DrawRoundedPanel(e.Graphics, c.ClientRectangle, Color.White, Color.FromArgb(226, 230, 244));
        }

        private void DrawRoundedPanel(Graphics g, Rectangle rect, Color fill, Color border)
        {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            Rectangle r = new Rectangle(rect.X, rect.Y, rect.Width - 1, rect.Height - 1);
            using (GraphicsPath path = RoundedRect(r, 18))
            using (Brush b = new SolidBrush(fill))
            using (Pen p = new Pen(border, 1F))
            {
                g.FillPath(b, path);
                g.DrawPath(p, path);
            }
        }

        private GraphicsPath RoundedRect(Rectangle bounds, float radius)
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

        private async void NextButtonClick(object sender, EventArgs e)
        {
            if (page < 3)
            {
                page++;
                RenderPage();
                return;
            }

            if (page == 3)
            {
                page = 4;
                RenderPage();
                return;
            }

            if (page == 4)
            {
                if (installExitCode < 0)
                {
                    await StartInstallAsync();
                    return;
                }
                if (installExitCode == 0)
                {
                    page = 5;
                    runtimeStage = 5;
                    RenderPage();
                    return;
                }
                Close();
                return;
            }

            Close();
        }

        private async Task StartInstallAsync()
        {
            installing = true;
            runtimeStage = 4;
            installExitCode = -1;
            logBox.Clear();
            AppendLog("AI Linker wizard started.");
            AppendLog("Selected LLM profile: " + llmCombo.Text);
            AppendLog("Install code: " + installCodeBox.Text);
            RenderPage();

            try
            {
                string workRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "AI Linker", "HermesInstaller");
                Directory.CreateDirectory(workRoot);
                string scriptPath = Path.Combine(workRoot, "install-hermes-mvp.ps1");
                ExtractResource(ScriptResourceName, scriptPath);
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
                runtimeStage = installExitCode == 0 ? 5 : 4;
                liveStatus.Text = installExitCode == 0 ? "Installation complete. AI Linker Console is ready for preview." : "Installation failed. Check the log.";
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

            if (text.StartsWith("[AILINKER:stage:", StringComparison.OrdinalIgnoreCase))
            {
                string stage = text.Replace("[AILINKER:stage:", "").Replace("]", "").Trim().ToLowerInvariant();
                if (stage.Contains("download")) runtimeStage = 1;
                else if (stage.Contains("install")) runtimeStage = 1;
                else if (stage.Contains("config")) runtimeStage = 2;
                else if (stage.Contains("diagnostic")) runtimeStage = 4;
                else if (stage.Contains("complete")) runtimeStage = 5;
                liveStatus.Text = "Current installer task: " + stage;
                for (int i = 0; i < stepCards.Length; i++) stepCards[i].SetState(i == runtimeStage, i < runtimeStage);
                return;
            }

            if (text.IndexOf("Hermes-Installer-Logs", StringComparison.OrdinalIgnoreCase) >= 0) lastLogPath = text.Trim();

            if (text.IndexOf("download", StringComparison.OrdinalIgnoreCase) >= 0) liveStatus.Text = "Downloading required files...";
            else if (text.IndexOf("extract", StringComparison.OrdinalIgnoreCase) >= 0) liveStatus.Text = "Extracting / preparing installer files...";
            else if (text.IndexOf("official Hermes installer", StringComparison.OrdinalIgnoreCase) >= 0) liveStatus.Text = "Running official Hermes installer...";
            else if (text.IndexOf("config", StringComparison.OrdinalIgnoreCase) >= 0) liveStatus.Text = "Applying LLM and terminal configuration...";
            else if (text.IndexOf("doctor", StringComparison.OrdinalIgnoreCase) >= 0) liveStatus.Text = "Running final diagnostics...";

            logBox.AppendText(text + Environment.NewLine);
        }

        private void ExtractResource(string resourceName, string outputPath)
        {
            using (Stream input = GetType().Assembly.GetManifestResourceStream(resourceName))
            {
                if (input == null) throw new InvalidOperationException("Embedded resource not found: " + resourceName);
                using (FileStream output = File.Create(outputPath)) input.CopyTo(output);
            }
        }

        private void OpenManual()
        {
            string path = Path.Combine(Path.GetTempPath(), "ai-linker-hermes-manual.html");
            File.WriteAllText(path, ManualHtml(), Encoding.UTF8);
            Process.Start(new ProcessStartInfo(path) { UseShellExecute = true });
        }

        private void OpenConsolePreview()
        {
            string path = Path.Combine(Path.GetTempPath(), "ai-linker-console-preview.html");
            File.WriteAllText(path, ConsoleHtml(), Encoding.UTF8);
            Process.Start(new ProcessStartInfo(path) { UseShellExecute = true });
        }

        private void OpenPaymentPreview()
        {
            MessageBox.Show("Payment and credit activation flow:\n\n1. User completes payment on AI Linker web page.\n2. Admin approves the install code.\n3. Server grants the initial $10 credit.\n4. AI Linker gateway deducts tokens by actual usage.\n5. If credit is depleted, the console opens recharge.\n\nThis requires backend implementation before production.", "AI Linker payment preview", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private string ManualHtml()
        {
            return "<!doctype html><html><head><meta charset='utf-8'><title>AI Linker Hermes Manual</title><style>body{font-family:Segoe UI,Arial;margin:40px;background:#f6f7fb;color:#20243a}section{background:white;padding:24px;border-radius:18px;margin:18px 0;box-shadow:0 8px 28px #dfe3f3}h1{color:#30226f}</style></head><body><h1>AI Linker Hermes 설치 매뉴얼</h1><section><h2>1. Create Agent</h2><p>Windows 환경 확인, Hermes 공식 설치기 다운로드, Hermes 실행파일 검증을 진행합니다.</p></section><section><h2>2. LLM Brain</h2><p>기본 LLM 프로필을 선택합니다. MVP는 OpenRouter 호환 기본값을 적용합니다.</p></section><section><h2>3. Access Code</h2><p>설치코드는 자동 입력됩니다. 향후 결제와 관리자 승인 후 기본 크레딧이 지급되는 흐름에 연결됩니다.</p></section><section><h2>4. Install</h2><p>다운로드, 설치, 설정, 스킬 확인, doctor 진단 로그를 실시간으로 확인합니다.</p></section><section><h2>5. AI Linker Console</h2><p>Hermes 실행, 잔액 확인, 사용량 통계, 충전, LLM 변경, 게이트웨이 연결 기능의 웹 콘솔로 확장됩니다.</p></section></body></html>";
        }

        private string ConsoleHtml()
        {
            return "<!doctype html><html><head><meta charset='utf-8'><title>AI Linker Console Preview</title><style>body{font-family:Segoe UI,Arial;background:#121427;color:white;margin:0}.wrap{padding:36px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.card{background:#20264a;border:1px solid #4550a0;border-radius:18px;padding:22px}.big{font-size:30px;font-weight:700;color:#55e6ff}button{padding:12px 18px;border-radius:10px;border:0;background:#55e6ff;font-weight:700}</style></head><body><div class='wrap'><h1>AI Linker Console Preview</h1><p>Production requires payment, license, credit, usage, and gateway backend.</p><div class='grid'><div class='card'><h2>Credit</h2><div class='big'>$10.00 pending</div><p>Granted after payment/admin approval.</p></div><div class='card'><h2>Tokens</h2><div class='big'>Pending</div><p>Token usage will sync from gateway.</p></div><div class='card'><h2>Usage</h2><div class='big'>0 calls</div><p>No production backend connected yet.</p></div><div class='card'><h2>Hermes</h2><button>Launch Hermes</button></div><div class='card'><h2>LLM</h2><button>Change Model</button></div><div class='card'><h2>Recharge</h2><button>Charge Credits</button></div></div></div></body></html>";
        }

        private bool ConfirmCancel()
        {
            return MessageBox.Show("Installation is running. Cancel anyway?", "AI Linker", MessageBoxButtons.YesNo, MessageBoxIcon.Warning) == DialogResult.Yes;
        }
    }

    internal sealed class GradientPanel : Panel
    {
        protected override void OnPaintBackground(PaintEventArgs e)
        {
            using (LinearGradientBrush bg = new LinearGradientBrush(ClientRectangle, Color.FromArgb(14, 18, 38), Color.FromArgb(78, 42, 142), 50F))
            {
                e.Graphics.FillRectangle(bg, ClientRectangle);
            }
        }
    }

    internal sealed class StepCard : Panel
    {
        private readonly int number;
        private readonly string title;
        private readonly string subtitle;
        private bool active;
        private bool done;

        public StepCard(int number, string title, string subtitle)
        {
            this.number = number;
            this.title = title;
            this.subtitle = subtitle;
            BackColor = Color.Transparent;
            DoubleBuffered = true;
        }

        public void SetState(bool active, bool done)
        {
            this.active = active;
            this.done = done;
            Invalidate();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            Rectangle rect = new Rectangle(0, 0, Width - 1, Height - 1);
            Color fill = active ? Color.FromArgb(82, 86, 160, 230) : (done ? Color.FromArgb(62, 75, 210, 180) : Color.FromArgb(42, 255, 255, 255));
            using (GraphicsPath path = Rounded(rect, 16))
            using (Brush b = new SolidBrush(fill))
            using (Pen p = new Pen(Color.FromArgb(78, 255, 255, 255)))
            {
                g.FillPath(b, path);
                g.DrawPath(p, path);
            }

            using (Brush circle = new SolidBrush(active || done ? Color.FromArgb(83, 232, 255) : Color.FromArgb(145, 150, 176)))
            using (Brush dark = new SolidBrush(Color.FromArgb(14, 18, 38)))
            using (Brush white = new SolidBrush(Color.White))
            using (Brush muted = new SolidBrush(Color.FromArgb(218, 226, 255)))
            using (Font numFont = new Font("Segoe UI", 9.5F, FontStyle.Bold))
            using (Font titleFont = new Font("Segoe UI", 9.2F, FontStyle.Bold))
            using (Font subFont = new Font("Segoe UI", 8F))
            {
                g.FillEllipse(circle, 16, 16, 30, 30);
                StringFormat sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center };
                g.DrawString(done ? "OK" : number.ToString(), numFont, dark, new RectangleF(16, 16, 30, 30), sf);
                g.DrawString(title, titleFont, white, 58, 11);
                g.DrawString(subtitle, subFont, muted, 58, 34);
            }
        }

        private GraphicsPath Rounded(Rectangle bounds, float radius)
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
    }
}
