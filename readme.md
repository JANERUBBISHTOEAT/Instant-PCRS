# Instant-PCRS

<!-- Image of instant noodle -->
[![Instant noodle wiki image](https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Mama_instant_noodle_block.jpg/1024px-Mama_instant_noodle_block.jpg)](https://en.wikipedia.org/wiki/Instant_noodles)
> The name of this project is inspired by the [instant noodle](https://en.wikipedia.org/wiki/Instant_noodles), which is a quick and easy way to get a meal (which I did a lot when I was (and still am) a student). This project is also a quick and easy way to get your PCRS (<https://cms-pcrs.utsc.utoronto.ca/*/...>) done.

The *PCRS website* is a course evaluation system used by the University of Toronto Scarborough (UTSC). It mainly consists of multiple choice questions, videos, and a few short answer questions.  
The function of this project is to automate the process of answering the multiple choice questions and watching the videos.  
**The purpose of this project is:**  

1. To save time for students who are confident in their knowledge of the course material, and want to get their PCRS done as quickly as possible
2. To help students who have not found the correct answer to a question and want to know the correct answer so they can spend more time on  understanding the answers rather than trying out different answers
3. For students who forgot to do their PCRS and want to get it done asap before the deadline and come back to it later.
This is quite possible imo because:
    - the PCRS does not take long to complete so it could be easily ignored at the beginning of each week
    - it does not come with any notification or alert to remind you to do it

**and not to**

1. **cheat on the PCRS**

## How to use

1. Go to the PCRS "Challenges" page (e.g. `https://cms-pcrs.utsc.utoronto.ca/coursenum/content/challenges/**/*`)
2. Simply copy the script in [`PCRS.js`](https://github.com/JANERUBBISHTOEAT/Instant-PCRS/blob/master/PCRS.js) and paste it into the **console** of your browser (F12)
3. There are two elements beside the button, and should be like this: `2 MCQs 2 Videos` if you have 2 MCQs and 2 videos
4. Click on the button that says "Instant PCRS" and wait for the script to finish
5. The two elements beside the button, one for MCQs and one for videos, will be showing the output of the script. For instance: `2/2 Finished 2/2 Finished`

## When to use

See the purpose section above.

## How it works

Preconditions:

- Infinite attempts for each MCQ
- The MCQs have html elements with the class name in a common format: `multiple_choice-***` where `***` is the id of the question

    ```html
    <div id="multiple_choice-***">
    ```

- The options for each MCQ is under the question's html element with the class name `checkbox`

    ```html
    <div class="controls">
        <label class="checkbox">
            <input type="checkbox" ...> Option 1
        </label>
        ...
    </div>
    ```

Procedure:

- Get the MCQs by `document.querySelectorAll('[id^="multiple_choice-"]');`
- For each MCQ, get the options by `.getElementsByClassName('checkbox');`
- Use ajax to send the request to the server to get the result
- Try empty; if it is correct, then skip to the next question
- Try each option, the option that is correct will increase the score by 1, and the option that is incorrect will decrease the score by 1
- After trying all the options, we know all the correct options and the incorrect options
- Send another ajax request to the server will all known correct options

For the videos, it is quite the same.

- Get the videos by `document.querySelectorAll('[id^="video-"]');`
- Send a request to the server to notify that the video is watched

    ```js
    data: {
        'csrftoken': getCookie('csrftoken'),
        'download': 'false'
    },
    ```
