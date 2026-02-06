// Questions data
const questions = [
    {
        id: 1,
        text: "このインタビューには特定のお仕事をされている方の参加をご遠慮いただいております。<br><br><strong>あなたは、製薬会社またはマスコミ以外でお勤めですか？</strong><br><br><small style='display:block; margin-top:12px; color:#8b7970; line-height:1.7;'>※製薬会社・マスコミにお勤めの方は、大変恐れ入りますが「いいえ」を選択してください<br>※それ以外の方（主婦・パート・会社員など）は「はい」を選択してください</small>"
    },
    {
        id: 2,
        text: "インタビューで見たり聞いたりする情報を他に共有しない同意書に別途ご同意が必要です。<br><br>同時に、あなたの情報も機密情報として適切に管理されます。<br><br>ご理解いただけますか？"
    },
    {
        id: 3,
        text: "卵巣がん（タイプは問いません）と診断を受けたことがありますか？"
    },
    {
        id: 4,
        text: "卵巣がんと診断されたのは、10年以内（2015年以降）ですか？"
    },
    {
        id: 5,
        text: "現在、医療機関に通院し、薬による治療を受けていますか？"
    },
    {
        id: 6,
        text: "2025年3月3日～3月13日の間に、60分程度のWebインタビュー（カメラOFF）にご参加いただくご意思はありますか？<br><small style='display:block; margin-top:10px; color:#5a6c7d;'>※PCまたはiPad等の端末が必要です（スマートフォンのみ不可）</small>"
    },
    {
        id: 7,
        text: "今回のインタビュー実施に必要な事務連絡を目的として、お名前・メールアドレスを、調査実施会社である株式会社シード・プランニングに共有することに同意いただけますか？"
    }
];

// State management
let currentQuestionIndex = 0;
let answers = [];

// DOM elements
const questionScreen = document.getElementById('questionScreen');
const screenOutScreen = document.getElementById('screenOutScreen');
const applicationScreen = document.getElementById('applicationScreen');
const questionNumber = document.getElementById('questionNumber');
const questionText = document.getElementById('questionText');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const progressBar = document.getElementById('progressBar');
const applicationForm = document.getElementById('applicationForm');

// Initialize
function init() {
    showQuestion(0);
    updateProgress();
}

// Show question
function showQuestion(index) {
    if (index >= questions.length) {
        // All questions answered with "Yes"
        showApplicationForm();
        return;
    }

    const question = questions[index];
    questionNumber.textContent = `質問 ${question.id}/${questions.length}`;
    questionText.innerHTML = question.text;
    
    // Enable buttons
    yesBtn.disabled = false;
    noBtn.disabled = false;
}

// Update progress bar
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// Handle Yes button click
function handleYes() {
    // Disable buttons to prevent double-click
    yesBtn.disabled = true;
    noBtn.disabled = true;

    answers.push({
        questionId: questions[currentQuestionIndex].id,
        answer: 'yes'
    });

    // Add animation
    yesBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        yesBtn.style.transform = '';
    }, 150);

    // Move to next question after delay
    setTimeout(() => {
        currentQuestionIndex++;
        updateProgress();
        
        if (currentQuestionIndex < questions.length) {
            showQuestion(currentQuestionIndex);
        } else {
            // All questions answered with Yes
            showApplicationForm();
        }
    }, 400);
}

// Handle No button click
function handleNo() {
    // Disable buttons to prevent double-click
    yesBtn.disabled = true;
    noBtn.disabled = true;

    answers.push({
        questionId: questions[currentQuestionIndex].id,
        answer: 'no'
    });

    // Add animation
    noBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        noBtn.style.transform = '';
    }, 150);

    // Show screen out after delay
    setTimeout(() => {
        showScreenOut();
    }, 400);
}

// Show screen out screen
function showScreenOut() {
    questionScreen.classList.remove('active');
    screenOutScreen.classList.add('active');
    
    // Hide progress bar
    document.querySelector('.progress-container').style.display = 'none';
}

// Show application form
function showApplicationForm() {
    questionScreen.classList.remove('active');
    applicationScreen.classList.add('active');
    
    // Update progress to 100%
    progressBar.style.width = '100%';
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!name || !email || !phone) {
        alert('すべての項目を入力してください。');
        return;
    }
    
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('正しいメールアドレスを入力してください。');
        return;
    }
    
    // Create email
    const recipientEmail = 'interview@example.com'; // Replace with actual email
    const subject = encodeURIComponent('卵巣がんのインタビュー申込');
    const body = encodeURIComponent(
        `このメールを送信してください。\n\n` +
        `お名前：${name}\n` +
        `メールアドレス：${email}\n` +
        `お電話番号：${phone}\n\n` +
        `---\n` +
        `このメールを送信することで、卵巣がん体験者の会スマイリーから、株式会社シード・プランニングへ、上記の個人情報がインタビュー参加に関する目的に限って共有されることに同意したものとみなされます。`
    );
    
    // Open email client
    const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
}

// Event listeners
yesBtn.addEventListener('click', handleYes);
noBtn.addEventListener('click', handleNo);
applicationForm.addEventListener('submit', handleFormSubmit);

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

// Prevent accidental navigation
window.addEventListener('beforeunload', (e) => {
    if (currentQuestionIndex > 0 && currentQuestionIndex < questions.length) {
        e.preventDefault();
        e.returnValue = '';
    }
});
