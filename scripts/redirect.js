document.addEventListener('DOMContentLoaded', () => {
    const queryParams = new URLSearchParams(window.location.search);
    const redirect = queryParams.get('redirect');
    const delay = parseInt(queryParams.get('delay'), 10) || 0;

    if (redirect) {
        setTimeout(() => {
            window.location.href = redirect;
        }, delay);
    }
});
