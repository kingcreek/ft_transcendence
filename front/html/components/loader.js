import { checkLoginStatus, loadLoginPage } from "../login/login.js"
import { loadMainPage } from "../menu/menu.js"

export function loadingAnimation() {
	const $loader = document.createElement("img");
	$loader.src = "./assets/loader.svg"
	$loader.alt = "Loading..."
	return $loader;
}

export function displayError(error, type, id) {
    const errorElement = document.createElement(type);
    (type === "ul") ? errorElement.innerHTML = error : errorElement.textContent = error;
    errorElement.style.color = 'red';
    const errorContainer = document.getElementById(id);
    // Remove existing error messages of the same type
    const existingErrors = errorContainer.querySelectorAll(type);
    existingErrors.forEach((existingError) => {
        errorContainer.removeChild(existingError);
    });

    // Append the new error message
    errorContainer.appendChild(errorElement);
}

export function handleServerError(errorData) {
    const errorMessagesList = [];

    const processErrors = (errorObject) => {
        for (const key in errorObject) {
            const errorMessages = errorObject[key];
            if (Array.isArray(errorMessages)) {
                // If it is an array, add the messages to the list
                errorMessagesList.push(...errorMessages.map(message => `<li>${message}</li>`));
            } else if (typeof errorMessages === 'object') {
                // If it is an object, handle nested errors recursively
                processErrors(errorMessages);
            }
        }
    };

    processErrors(errorData.error);
    if (errorMessagesList.length > 0) {
        const errorMessage = errorMessagesList.join('');
        displayError(errorMessage, 'ul', 'registrationForm');
    }
}

export function displayLoginOrMenu() {
    if (checkLoginStatus() === true)
        loadMainPage();
    else
        loadLoginPage();
}