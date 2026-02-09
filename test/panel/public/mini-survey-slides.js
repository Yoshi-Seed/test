(function () {
  'use strict';

  function go(url) {
    window.location.href = url;
  }

  function handleOverview() {
    var start = document.querySelector('[data-action="start-survey"]');
    if (start) {
      start.addEventListener('click', function () {
        go('mini-survey-slide-01-single.html');
      });
    }
  }

  function handleSingle() {
    var form = document.querySelector('[data-form="single"]');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var selected = form.querySelector('input[name="single"]:checked');
      if (!selected) {
        alert('1つ選択してください。');
        return;
      }
      go('mini-survey-slide-02-multi.html');
    });
  }

  function handleMulti() {
    var form = document.querySelector('[data-form="multi"]');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var checked = form.querySelectorAll('input[name="multi"]:checked');
      if (checked.length === 0) {
        alert('1つ以上選択してください。');
        return;
      }
      go('mini-survey-slide-03-open-end.html');
    });
  }

  function handleOpenEnd() {
    var form = document.querySelector('[data-form="open-end"]');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var text = form.querySelector('#open-end-answer');
      if (!text || text.value.trim().length === 0) {
        alert('自由記述を入力してください。');
        return;
      }
      go('mini-survey-slide-04-numeric.html');
    });
  }

  function handleNumeric() {
    var form = document.querySelector('[data-form="numeric"]');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('#score');
      var value = input ? Number(input.value) : NaN;
      if (Number.isNaN(value) || value < 0 || value > 10) {
        alert('0〜10の範囲で入力してください。');
        return;
      }
      alert('ご回答ありがとうございました。100ptを付与しました。');
      go('survey-complete.html');
    });
  }

  function handleBackButtons() {
    document.querySelectorAll('[data-back]').forEach(function (button) {
      button.addEventListener('click', function () {
        go(button.getAttribute('data-back'));
      });
    });
  }

  handleOverview();
  handleSingle();
  handleMulti();
  handleOpenEnd();
  handleNumeric();
  handleBackButtons();
})();
