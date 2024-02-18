// Test URL'S
// openAIParaPhraseURL = 'http://localhost:5678/webhook-test/openai-paraphrase';
// geminiParaPhraseURL = 'http://localhost:5678/webhook-test/gemini-paraphrase';
// twiterPostURL = 'http://localhost:5678/webhook-test/post-twitter';
// linkedinPostURL = 'http://localhost:5678/webhook-test/post-linkedin';

// production URL'S
openAIParaPhraseURL = 'http://localhost:5678/webhook/openai-paraphrase';
geminiParaPhraseURL = 'http://localhost:5678/webhook/gemini-paraphrase';
twiterPostURL = 'http://localhost:5678/webhook/post-twitter';
linkedinPostURL = 'http://localhost:5678/webhook/post-linkedin';

$(document).ready(function () {
    $('#paraphrase-button').click(function () {
        load();
        paraPhraseFunction();
        unLoad();
    });

    $('#post-button').click(function () {
        load();
        postFunction();
        unLoad();
    });

    function load() {
        $('#container').addClass('blurred');
        $('.loading').show();
    }

    function unLoad() {
        $('#container').removeClass('blurred');
        $('.loading').hide();
    }

    function paraPhraseFunction() {
        var textBoxValue = $('#textInput').val();

        function paraphrase(url) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: url,
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ text: textBoxValue }),
                    success: function (response) {
                        console.log('Data sent successfully');
                        resolve(response);
                    },
                    error: function (err) {
                        console.error('Error in paraphrasing data:', err);
                        reject(err);
                    }
                });
            });
        }

        Promise.all([
            paraphrase(openAIParaPhraseURL),
            paraphrase(geminiParaPhraseURL)
        ]).then(function (responses) {
            $('#openaioutput').val(responses[0]['OpenAI_Response']);
            $('#geminioutput').val(responses[1]['Gemini_Response']);
        }).catch(function (err) {
            console.error('Error in paraphrase requests:', err);
        });
    }

    function postFunction() {
        if (document.getElementById('openai').checked)
            var textBoxValue = $('#openaioutput').val();
        else if (document.getElementById('gemini').checked)
            var textBoxValue = $('#geminioutput').val();
        else {
            showErrorMessage('Please select the output from either OpenAI or Gemini');
            return false;
        }
        if (textBoxValue.trim() == '') {
            showErrorMessage('Post Content can not be blank');
            return false;
        }

        function post(url) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: url,
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ text: textBoxValue }),
                    success: function (response) {
                        console.log('Data sent successfully');
                        resolve(response);
                    },
                    error: function (err) {
                        console.error('Error posting data:', err);
                        reject(err);
                    }
                });
            });
        }

        var socialMediaPlatforms = [
            { id: 'twitter', url: twiterPostURL },
            { id: 'linkedin', url: linkedinPostURL }
        ];

        var checkedPlatforms = socialMediaPlatforms.filter(function (platform) {
            return document.getElementById(platform.id).checked;
        });

        if (checkedPlatforms.length > 0) {
            var postPromises = checkedPlatforms.map(function (platform) {
                return post(platform.url).catch(function (err) {
                    console.error('Error in ' + platform.id + ' post requests:', err);
                });
            });

            Promise.all(postPromises).then(function (responses) {
                showSuccessMessage(responses);
            });
        } else {
            showErrorMessage('Please select either Twitter or LinkedIn or both');
        }
    }

    function showErrorMessage(err) {
        $('#successMessage').hide();
        $('#errorMessage').text(err).show();
    }

    function showSuccessMessage(message) {
        $('#errorMessage').hide();
        $('#successMessage').text(message.join(', ')).show();
    }

    $('#openai').click(function () {
        document.getElementById('gemini').checked = false;
    });

    $('#gemini').click(function () {
        document.getElementById('openai').checked = false;
    });

});

