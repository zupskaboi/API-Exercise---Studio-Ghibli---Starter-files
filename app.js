/*const url = 'https://ghibliapi.herokuapp.com/films';*/
const APIController = (function () {
    const clientId = '7fdee6e19f2c46d8a030b97141c074a1';
    const clientSecret = 'a48ca8d2c25f4ce69baddcc75dbbd669';

    //private methods
    //Hier heb ik de functies om de spotify data op te halen. De data die ik ophaal zijn: de Token en de genres van spotify.
    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    const _getGenres = async (token) => {
        const result = await fetch('https://api.spotify.com/v1/browse/categories', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();
        return data.categories.items;
    }

    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        }
    }
})();

const UIController = (function () {

    //Een object dat ervoor zorgt dat de data naar de juiste html selectors gaan.
    const DOMElements = {
        selectGenre: '#select_genre',
        hfToken: '#hidden_token'
    }

    //public methods
    return {

        //Hier zoek ik naar de input veld voor de genre.
        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGenre)
            }
        },

        //Hier maak ik het lijstje voor de data
        createGenre(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        },

        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }
})();

const APPController = (function (UICtrl, APICtrl) {

    const DOMInputs = UICtrl.inputField();

    const loadGenres = async () => {
        const token = await APICtrl.getToken();

        UICtrl.storeToken(token);
        //Hier krijg ik de genre data met behulp van het Token
        const genres = await APICtrl.getGenres(token);
        //Hier stop ik de data in de lijst element
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    }

    DOMInputs.genre.addEventListener('change', async () => {
        //reset the playlist
        UICtrl.resetPlaylist();
        //get the token that's stored on the page
        const token = UICtrl.getStoredToken().token;
        // get the genre select field
        const genreSelect = UICtrl.inputField().genre;
        // get the genre id associated with the selected genre
        const genreId = genreSelect.options[genreSelect.selectedIndex].value;
    });

    return {
        init() {
            console.log('App is starting');
            loadGenres();
        }
    }
})(UIController, APIController);

APPController.init();