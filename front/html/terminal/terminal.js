
var Terminal = Terminal || {};
var Command  = Command  || {};

export function init(customData = null) {
    new Terminal.Events('cmdline', 'output');
}

Terminal.Events = function(inputElement, OutputElement) {
    
    var input = document.getElementById(inputElement);
    var body  = document.getElementById('myWindowTerminal-content');
      
    input.onkeydown = function(event) {
        if (event.which == 13 || event.keyCode == 13) {
            const token = sessionStorage.getItem('token')
            var cmd = input.value;
            if (cmd == '')
                return false;
            if (cmd == "clear") {
                clear(OutputElement);
                input.value = '';
                return false;
            }
            const url = '/api/user_management/execute/';
            const data = { "command": cmd };
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data)
            };
            fetch(url, options).then(response => {
                if (response.ok)
                    return response.json();
                throw new Error('Error al ejecutar la solicitud POST');
            })
            .then(data => {
                console.log(data);
                preserveInput(OutputElement, cmd)
                showOutput(OutputElement, data.output);
            })
            .catch(error => {
                console.error('Error:', error);
            });
            input.value = '';
        }
        return true;
    };
    
    // Click Body
    body.onclick = function() {
        input.focus();
    };
};

function preserveInput(element, cmd) {
    var outputElement = document.getElementById(element);
    var fromContent = outputElement.innerHTML;
    fromContent += '<div class="cmd-output" style="color: green;">';
    fromContent += "$>";
    fromContent += cmd;
    fromContent += '</div>';
    outputElement.innerHTML = fromContent;
}

function showOutput(element, data) {
    var outputElement = document.getElementById(element);
    const lines = data.split('\n');
    var fromContent = outputElement.innerHTML;
    lines.forEach(l => {
        if (l.trim() !== '') {
            fromContent += '<div class="cmd-output">';
            fromContent += l;
            fromContent += '</div>';
        }
    });
    outputElement.innerHTML = fromContent;
    input.focus();
}

function clear(element) {
    var outputElement = document.getElementById(element);
    outputElement.innerHTML = '';
    input.focus();
}
