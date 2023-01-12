// ==UserScript==
// @name         Instant-PCRS
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://cms-pcrs.utsc.utoronto.ca/cscb09w23/content/challenges/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=utoronto.ca
// @grant        unsafeWindow
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    function checkIfIsMCQ() {
        // if a content includes 'multiple_choice-***', then it has a MCQ
        return document.body.innerHTML.includes('multiple_choice-');
    }

    // Define a class that stores the info of a choice
    class Choice {
        constructor(id, text, value, isCorrect) {
            this.id = id;
            this.text = text;
            this.value = value;
            this.isCorrect = isCorrect;
        }
    }

    // Define a class that stores choices of a question
    class Question {
        constructor(id, choices) {
            this.id = id;
            this.choices = choices;
        }
    }

    // Get cookie
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }

    // Send a request to the server to get test cases
    function runAnswer(submission, questionId) {
        // POST a request to the server with 'csrftoken' and 'submission'
        var csrftoken = getCookie('csrftoken');
        // console.log('cookie: ' + csrftoken);

        // If submissions has more than one element, make it string
        var submission_str;
        var data;
        // console.log('Type of submission: ' + typeof(submission));
        if (typeof(submission) == 'string') {
            data = 'csrfmiddlewaretoken=' + csrftoken + '&submission=' + submission;
        }
        else if (typeof(submission) == 'object') {
            if (submission.length == 0) {
                data = 'csrfmiddlewaretoken=' + csrftoken;
            }
            else {
                // console.log('Special submission: ' + submission);
                // console.log(submission.join('&submission='));
                submission_str = submission.join('&submission=');
                data = 'csrfmiddlewaretoken=' + csrftoken + '&submission=' + submission_str;
            }
        }
        // console.log('data: ' + data);
        // var data = {
        //     'csrfmiddlewaretoken': csrftoken,
        //     // 'question_id': questionId,
        //     'submission': submission
        // };

        // Get curren URL of the page
        // https://cms-pcrs.utsc.utoronto.ca/cscb09w23/content/challenges/115/1
        // https://cms-pcrs.utsc.utoronto.ca/cscb09w23/, /challenges/115/1
        // https://cms-pcrs.utsc.utoronto.ca/cscb09w23/problems/multiple_choice/235/run

        var url = window.location.href.split('content')[0] +
            'problems/' + questionId.split('-')[0] +
            '/' + questionId.split('-')[1] + '/run';

        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            async: false,
            success: function (data) {
                result = data;
                // console.log(result);
                // console.log(result.score + ' / ' + result.max_score);
            },
            error: function (data) {
                console.log(data);
                // Create a Alertbox to show the error
                var text = 'Error: ' + data.responseText;
                alert(text);
            }
        });
        return [result.score, result.max_score];
    }

    // Try to get full marks
    function getFullMark(options, questionId) {
        console.log('Sending request to the server...');
        var scores = runAnswer([], questionId);
        // console.log('scores: ' + scores);

        var current_score = scores[0];
        var max_score = scores[1];
        var empty_score = current_score;

        var correct_choices = max_score - current_score;

        console.log(correct_choices + ' options needed.');

        var i;
        for (i = 0; i < options.length; i++) {
            var tmp_score = runAnswer(options[i].value, questionId);
            // console.log('Option ' + options[i].value + ' score: ' + tmp_score[0]);

            if (tmp_score[0] > empty_score) {
                // empty_score = tmp_score[0];
                options[i].isCorrect = true;
                console.log('Option ' + options[i].value + ' is correct.');
            }
        }

        var choice_list = []
        for (i = 0; i < options.length; i++) {
            if (options[i].isCorrect) {
                choice_list.push(options[i].value);
            }
        }

        console.log('Final choice: ' + choice_list);

        scores = runAnswer(choice_list, questionId);
        current_score = scores[0];
        max_score = scores[1];
        
        console.log(current_score, max_score);
        return current_score == max_score;
    }

    // Get the options for MQC
    function getMCQQuestions() {
        // Get the questions by id contains 'multiple_choice-***'
        // <div id="multiple_choice-1117">
        var questionElements = document.querySelectorAll('[id^="multiple_choice-"]');
        // console.log(questionElements);

        var optionElements = document.getElementsByClassName('controls');
        console.log(optionElements.length + ' questions in total.');
        // console.log(optionElements);

        // Get the options by the class name 'checkbox'
        // <input type="checkbox" name="options" id="id_options_1" value="1117">
        var finished_cnt = 0;
        for (var i = 0; i < optionElements.length; i++) {
            var question = new Question();
            question.choices = [];

            // question.id = problem_pk;
            question.id = questionElements[i].id;

            // Get the id of the option
            var options = optionElements[i].getElementsByTagName('input');
            console.log(options.length + ' options in total.')

            for (var j = 0; j < options.length; j++) {
                // console.log(options[j]);
                var option = options[j];
                var id = option.id;
                var text = option.innerText;
                var value = option.value;
                var isCorrect = false;
                var choice = new Choice(id, text, value, isCorrect);
                // console.log(choice);
                question.choices.push(choice);
            }
            console.log(question);

            // Try to get full marks
            if (getFullMark(options, question.id)) {
                finished_cnt++;
            }

            // // Update HTML element
            // questions_cnt = questionElements.length;
            // var solved_cnt = document.getElementById('questions_cnt');
            // solved_cnt.innerText = finished_cnt + ' / ' + questions_cnt;

        }
        console.log(finished_cnt + ' questions finished.');
        return finished_cnt;
    }

    console.log(checkIfIsMCQ()); // true or false
    // Create a HTML button to display the result in student-navbar
    var result = document.createElement('ul');
    result.className = 'pcrs-navbar-nav';
    result.id = 'instant-pcrs';

    if (checkIfIsMCQ()) {
        result.innerHTML = '<li><a>Instant PCRS</a></li>';
    } else {
        result.innerHTML = '<li><a>Contains no MCQ</a></li>';
    }

    // Append the element to student-navbar
    var navbar = document.getElementsByClassName('collapse navbar-collapse')[0];
    navbar.appendChild(result);

    // Append the number of questions
    var questionElements = document.querySelectorAll('[id^="multiple_choice-"]');
    var questions_cnt = document.createElement('ul');
    questions_cnt.className = 'pcrs-navbar-nav';
    questions_cnt.id = 'questions_cnt';
    questions_cnt.innerHTML = '<li><a>' + questionElements.length + '</a></li>';
    navbar.appendChild(questions_cnt);

    // Monitor the hit of id 'instant-pcrs'
    document.getElementById('instant-pcrs').addEventListener('click', function () {
        var finished_cnt = getMCQQuestions();
        // Return the number of questions solved
        questions_cnt.innerHTML = '<li><a>' + finished_cnt + '/' + questionElements.length + ' Finished</a></li>';
    });

})();