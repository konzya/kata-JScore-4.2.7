import '../scss/style.scss';

const inputSearch = document.querySelector('.repositories__search');
const repositoriesList = document.querySelector('.repositories__list');
const repositoriesDatalist = document.querySelector('.repositories__datalist');

let repoObjects;
let searchTimer;

let encr;
let encrKey;
let decrKey;

function getKey() {
  return window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );
}

getKey().then(data => {
  console.log(data);
  encrKey = data.publicKey;
  decrKey = data.privateKey;
  window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP"
    },
    encrKey,
    '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'
  ).then(data => console.log(data));
});




inputSearch.addEventListener('input', (event) => {
  if (inputSearch.value === '') {
    clearTimeout(searchTimer);
    repositoriesDatalist.innerHTML = '';
  } else {
    clearTimeout(searchTimer);
    showLoading();
    searchTimer = setTimeout(() => {
      getOptions();
    }, 250);
  }
})

repositoriesDatalist.addEventListener('click', (event) => {
  if (event.target.className === 'repositories__option') {
    inputSearch.value = '';
    repositoriesDatalist.innerHTML = '';
    let li = renderItem(event.target);
    setTimeout(() => {
      li.style.maxHeight = `${li.scrollHeight}px`;
      li.style.transform = 'rotateX(0deg)';
    }, 50);
  }
});

repositoriesList.addEventListener('click', (event) => {
  if (event.target.className === 'repositories__button repositories__button--close') {
    event.target.parentElement.style.transition = 'max-height 1s, transform 1s, padding 1s, margin 1s';
    event.target.parentElement.style.transform = 'rotateX(-90deg)';
    event.target.parentElement.style.maxHeight = '0px';
    event.target.parentElement.style.marginBottom = '0px';
    event.target.parentElement.style.padding = '0px 20px';
    event.target.parentElement.style.border = 'none';

    setTimeout(() => event.target.parentElement.remove(), 3000);
    console.log('close');
  }
})


inputSearch.addEventListener('blur', () => {
  setTimeout(() => repositoriesDatalist.style.maxHeight = '0px', 50)
});

inputSearch.addEventListener('focus', () => {
  repositoriesDatalist.style.maxHeight = `${repositoriesDatalist.scrollHeight}px`;
})

function renderItem(element) {
  let repoName = element.textContent;
  let repo = repoObjects.find((item) => item.name === repoName);
  let li = document.createElement('li');
  li.classList.add('repositories__item');
  let name = document.createElement('span');
  name.classList.add('repositories__name');
  name.classList.add('repositories__span');
  name.textContent = repo.name;
  let owner = document.createElement('span');
  owner.classList.add('repositories__owner');
  owner.classList.add('repositories__span');
  owner.textContent = repo.owner.login;
  let stars = document.createElement('span');
  stars.classList.add('repositories__stars');
  stars.classList.add('repositories__span');
  stars.textContent = repo.stargazers_count;
  let closeButton = document.createElement('button');
  closeButton.classList.add('repositories__button');
  closeButton.classList.add('repositories__button--close');

  li.append(name);
  li.append(owner);
  li.append(stars);
  li.append(closeButton);
  repositoriesList.append(li);
  return li;
}


async function searchRepos() {
  try {
    return fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(`${inputSearch.value} in:name`)}&sort=stars&per_page=5`, {
    headers: {
      Accept: 'application/vnd.github+json',
    }
  })
    .then( (response) => response.json())
  } catch (error) {
    console.log(error);
  }

}

function renderOptions(repos) {
  repositoriesDatalist.innerHTML = '';
  let fragment = document.createDocumentFragment();

  for (let repo of repos){
    let option = document.createElement('li');
    option.classList.add('repositories__option');
    option.textContent = repo.name;
    fragment.append(option);
  }
  repositoriesDatalist.append(fragment);
  repositoriesDatalist.style.maxHeight = `${repositoriesDatalist.scrollHeight}px`;
}


async function getOptions() {
    let response = await searchRepos();
    if (Array.isArray(response.items)) {
      if (response.items.length === 0) {
        showOptionsError('No such repository')
      } else {
        repoObjects = response.items;
        renderOptions(response.items);
      }
    } else {
      console.log(response);
      showOptionsError(response.message);
    }
}

function showOptionsError(message) {
  const error = document.createElement('span');
  error.textContent = message;
  error.classList.add('repositories__error');
  repositoriesDatalist.innerHTML = '';
  repositoriesDatalist.append(error);
  repositoriesDatalist.style.maxHeight = `${repositoriesDatalist.scrollHeight}px`;
}

function showLoading() {
  repositoriesDatalist.innerHTML = '';
  let img = document.createElement('img');
  img.src = './img/loading.svg';
  img.alt = 'Загрузка';
  img.classList.add('repositories__loading');
  repositoriesDatalist.append(img);

  setTimeout(() => {
    repositoriesDatalist.style.maxHeight = `${repositoriesDatalist.scrollHeight}px`;
  }, 30)
}



