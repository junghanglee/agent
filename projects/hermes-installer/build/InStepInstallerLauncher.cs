using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace InStepInstaller
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
        private const string ScriptResourceName = "InStepInstaller.Resources.install-hermes-mvp.ps1";
        private const string HermesBannerResourceName = "InStepInstaller.Resources.hermes-banner.png";

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
            Text = "InStep - Hermes AI Agent 설치 마법사";
            StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = true;
            AutoScaleMode = AutoScaleMode.Dpi;
            ClientSize = new Size(920, 620);
            MinimumSize = new Size(920, 620);
            Font = new Font("Segoe UI", 9F);
            BackColor = Color.White;

            try
            {
                using (Stream iconStream = GetType().Assembly.GetManifestResourceStream("InStepInstaller.Resources.instep.ico"))
                {
                    if (iconStream != null) Icon = new Icon(iconStream);
                }
            }
            catch { }

            sidebar.Dock = DockStyle.Left;
            sidebar.Width = 260;
            sidebar.Paint += SidebarPaint;
            Controls.Add(sidebar);

            rightHost.Dock = DockStyle.Fill;
            rightHost.BackColor = Color.White;
            Controls.Add(rightHost);

            buttonBar.Dock = DockStyle.Bottom;
            buttonBar.Height = 72;
            buttonBar.Padding = new Padding(20, 18, 20, 18);
            buttonBar.BackColor = Color.FromArgb(248, 249, 252);
            rightHost.Controls.Add(buttonBar);

            buttonFlow.Dock = DockStyle.Right;
            buttonFlow.FlowDirection = FlowDirection.LeftToRight;
            buttonFlow.WrapContents = false;
            buttonFlow.AutoSize = true;
            buttonBar.Controls.Add(buttonFlow);

            backButton.Text = "이전";
            backButton.Width = 96;
            backButton.Height = 34;
            backButton.Margin = new Padding(0, 0, 8, 0);
            backButton.Click += delegate { if (page > 0) { page--; RenderPage(); } };
            buttonFlow.Controls.Add(backButton);

            nextButton.Text = "다음";
            nextButton.Width = 116;
            nextButton.Height = 34;
            nextButton.Margin = new Padding(0, 0, 8, 0);
            nextButton.Click += NextButtonClick;
            buttonFlow.Controls.Add(nextButton);

            cancelButton.Text = "취소";
            cancelButton.Width = 88;
            cancelButton.Height = 34;
            cancelButton.Margin = new Padding(0);
            cancelButton.Click += delegate { if (!installing || ConfirmCancel()) Close(); };
            buttonFlow.Controls.Add(cancelButton);

            content.Dock = DockStyle.Fill;
            content.Padding = new Padding(42, 32, 42, 24);
            content.BackColor = Color.White;
            rightHost.Controls.Add(content);
            content.BringToFront();
            buttonBar.BringToFront();

            titleLabel.Dock = DockStyle.Top;
            titleLabel.Height = 52;
            titleLabel.Font = new Font("Segoe UI", 21F, FontStyle.Bold);
            titleLabel.ForeColor = Color.FromArgb(28, 30, 48);
            titleLabel.TextAlign = ContentAlignment.MiddleLeft;
            titleLabel.AutoEllipsis = true;
            content.Controls.Add(titleLabel);

            stepLabel.Dock = DockStyle.Top;
            stepLabel.Height = 32;
            stepLabel.Font = new Font("Segoe UI", 10F, FontStyle.Bold);
            stepLabel.ForeColor = Color.FromArgb(90, 85, 170);
            stepLabel.TextAlign = ContentAlignment.MiddleLeft;
            stepLabel.AutoEllipsis = true;
            content.Controls.Add(stepLabel);
            stepLabel.BringToFront();

            logBox.Dock = DockStyle.Bottom;
            logBox.Height = 190;
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
            progress.Margin = new Padding(0, 0, 0, 12);
            progress.Style = ProgressBarStyle.Marquee;
            progress.Visible = false;
            content.Controls.Add(progress);

            hermesBanner.Dock = DockStyle.Bottom;
            hermesBanner.Height = 90;
            hermesBanner.SizeMode = PictureBoxSizeMode.Zoom;
            hermesBanner.BackColor = Color.White;
            content.Controls.Add(hermesBanner);
            LoadHermesBanner();

            bodyLabel.Dock = DockStyle.Fill;
            bodyLabel.Font = new Font("Segoe UI", 11F);
            bodyLabel.ForeColor = Color.FromArgb(58, 62, 82);
            bodyLabel.TextAlign = ContentAlignment.TopLeft;
            bodyLabel.Padding = new Padding(0, 22, 0, 10);
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
            using (LinearGradientBrush bg = new LinearGradientBrush(r, Color.FromArgb(17, 19, 38), Color.FromArgb(82, 40, 132), 45F))
            {
                g.FillRectangle(bg, r);
            }

            using (Font brand = new Font("Segoe UI", 24F, FontStyle.Bold))
            using (Font small = new Font("Segoe UI", 10F))
            using (Font stepFont = new Font("Segoe UI", 9.5F, FontStyle.Bold))
            using (Brush white = new SolidBrush(Color.White))
            using (Brush muted = new SolidBrush(Color.FromArgb(210, 225, 255)))
            using (Brush cyan = new SolidBrush(Color.FromArgb(70, 230, 255)))
            using (Pen line = new Pen(Color.FromArgb(110, 255, 255, 255), 2F))
            {
                g.DrawString("InStep", brand, white, 26, 28);
                g.DrawString("Hermes AI Agent", small, muted, 30, 74);

                int x = 42;
                int y0 = 155;
                g.DrawLine(line, x + 12, y0 + 12, x + 12, y0 + 195);
                DrawStep(g, 1, "Agent 생성", "Hermes 설치", y0, page >= 1, stepFont, white, muted, cyan);
                DrawStep(g, 2, "두뇌 이식", "LLM 기본 연결", y0 + 70, page >= 2, stepFont, white, muted, cyan);
                DrawStep(g, 3, "메신저 연결", "확장 연결 준비", y0 + 140, page >= 3, stepFont, white, muted, cyan);

                g.DrawString("로그: Desktop\\Hermes-Installer-Logs", small, muted, 26, Math.Max(430, sidebar.Height - 70));
            }
        }

        private void DrawStep(Graphics g, int num, string title, string desc, int y, bool active, Font font, Brush white, Brush muted, Brush cyan)
        {
            using (Brush inactive = new SolidBrush(Color.FromArgb(96, 255, 255, 255)))
            using (Font numFont = new Font("Segoe UI", 9F, FontStyle.Bold))
            using (Brush dark = new SolidBrush(Color.FromArgb(18, 20, 38)))
            using (Font descFont = new Font("Segoe UI", 8.5F))
            {
                Brush circle = active ? cyan : inactive;
                g.FillEllipse(circle, 42, y, 26, 26);
                StringFormat sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center };
                g.DrawString(num.ToString(), numFont, active ? dark : white, new RectangleF(42, y, 26, 26), sf);
                g.DrawString(title, font, white, 82, y - 2);
                g.DrawString(desc, descFont, muted, 82, y + 19);
            }
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
                titleLabel.Text = "InStep 설치 마법사";
                stepLabel.Text = "Hermes AI Agent 원스탑 설치";
                bodyLabel.Text = "이 설치 마법사는 Hermes AI Agent 기본 설치를 자동으로 진행합니다.\r\n\r\n진행 단계:\r\n1. Hermes AI Agent 생성하기\r\n2. Hermes에 두뇌 이식하기, 즉 LLM 기본 연결 설정\r\n3. 메신저 연결 준비와 설치 진단\r\n\r\nAPI 키, 메신저 로그인처럼 사용자 비밀값이 필요한 항목은 설치 후 선택 설정으로 남겨둡니다.";
                nextButton.Text = "시작";
            }
            else if (page == 1)
            {
                titleLabel.Text = "1단계. Hermes AI Agent 생성하기";
                stepLabel.Text = "필수 구성요소와 Hermes 본체 준비";
                bodyLabel.Text = "Windows 사용자 영역에 Hermes 설치 환경을 만듭니다.\r\n\r\n자동 처리 항목:\r\n- Git, Python, Node.js 등 필수 구성요소 확인\r\n- Hermes 공식 설치 스크립트 실행\r\n- Hermes 실행 파일 검증\r\n\r\n다음을 누르면 LLM 기본 설정 안내로 이동합니다.";
                nextButton.Text = "다음";
            }
            else if (page == 2)
            {
                titleLabel.Text = "2단계. Hermes에 두뇌 이식하기";
                stepLabel.Text = "LLM 기본 연결 설정";
                bodyLabel.Text = "Hermes가 바로 실행 가능한 상태가 되도록 안전한 기본값을 적용합니다.\r\n\r\n자동 기본값:\r\n- model.provider = auto\r\n- model.base_url = OpenRouter 호환 주소\r\n- model.default = anthropic/claude-opus-4.6\r\n\r\n사용자 API 키는 설치파일에 포함하지 않습니다.";
                nextButton.Text = "설치 시작";
            }
            else if (page == 3)
            {
                titleLabel.Text = installing ? "설치 진행 중" : (installExitCode == 0 ? "설치 완료" : "설치 실패");
                stepLabel.Text = installing ? "Agent 생성, 두뇌 연결, 메신저 준비를 진행 중입니다" : (installExitCode == 0 ? "InStep Hermes 설치가 완료되었습니다" : "설치 로그를 확인해야 합니다");
                bodyLabel.Text = installing ? "잠시만 기다려 주세요. 설치 과정은 네트워크 상태에 따라 몇 분 이상 걸릴 수 있습니다.\r\n\r\n아래 로그 창에서 현재 진행 상황을 확인할 수 있습니다." : (installExitCode == 0 ? "Hermes 기본 설치와 진단이 끝났습니다.\r\n\r\n다음 단계에서 API 키 또는 메신저 연결을 선택 설정할 수 있습니다." : "설치가 정상 완료되지 않았습니다.\r\n\r\n로그 위치: " + lastLogPath);
                nextButton.Text = installExitCode == 0 ? "마침" : "닫기";
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
                string workRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "InStep", "HermesInstaller");
                Directory.CreateDirectory(workRoot);
                string scriptPath = Path.Combine(workRoot, "install-hermes-mvp.ps1");
                ExtractResource(ScriptResourceName, scriptPath);
                AppendLog("InStep wizard started.");
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
                stepLabel.Text = "2단계 진행 중: Hermes에 두뇌 이식하기";
                sidebar.Invalidate();
            }
            else if (text.IndexOf("gateway", StringComparison.OrdinalIgnoreCase) >= 0 || text.IndexOf("skills", StringComparison.OrdinalIgnoreCase) >= 0 || text.IndexOf("doctor", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                stepLabel.Text = "3단계 진행 중: 메신저 연결 준비와 진단";
                sidebar.Invalidate();
            }
            else if (text.IndexOf("Installing", StringComparison.OrdinalIgnoreCase) >= 0 || text.IndexOf("Hermes executable", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                stepLabel.Text = "1단계 진행 중: Hermes AI Agent 생성하기";
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
            return MessageBox.Show("설치가 진행 중입니다. 정말 취소할까요?", "InStep", MessageBoxButtons.YesNo, MessageBoxIcon.Warning) == DialogResult.Yes;
        }
    }
}
