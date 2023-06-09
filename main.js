let books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOSKHELF_APPS';

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return { 
    id, 
    title, 
    author, 
    year, 
    isCompleted 
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}


function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser anda tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = `Penulis: ${bookObject.author}`;

  const textYear = document.createElement('p');
  textYear.innerText = `Tahun: ${bookObject.year}`;

  const article = document.createElement('article');
  article.classList.add('book_item');
  article.append(textTitle, textAuthor, textYear);
  article.setAttribute('id', `${bookObject.id}`);

  const undoButton = document.createElement('button');
  undoButton.classList.add('green');

  if (bookObject.isCompleted) {
    undoButton.innerText = 'Belum selesai dibaca';
    undoButton.addEventListener('click', function () {
      undoBookFromCompleted(bookObject.id);
    });
  } else {
    undoButton.innerText = 'Selesai dibaca';
    undoButton.addEventListener('click', function () {
      addBookToCompleted(bookObject.id);
    });
  }

  const updateButton = document.createElement('button');
  updateButton.classList.add('yellow');
  updateButton.innerText = 'Update';
  updateButton.addEventListener('click', function () {
    const popItem = document.querySelector('.pop_item');
    const popClose = document.getElementById('popClose');
    const bookId = this.closest('.book_item').id;
    const updateForm = document.getElementById('updateBook');
    const bookItem = findBook(Number(bookId));

    const textTitle = document.getElementById('updateBookTitle');
    const textAuthor = document.getElementById('updateBookAuthor');
    const textYear = document.getElementById('updateBookYear');
    const isComplete = document.getElementById('updateBookIsComplete');

    textTitle.value = bookItem.title;
    textAuthor.value = bookItem.author;
    textYear.value = bookItem.year;
    isComplete.checked = bookItem.isCompleted;

    updateForm.addEventListener('submit', function (event) {
      event.preventDefault();
      updateBook(bookId);
      popItem.classList.remove('item_active');
    });

    popItem.classList.add('item_active');
    popClose.addEventListener('click', function () {
      popItem.classList.remove('item_active');
    });
  });

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('red');
  deleteButton.innerText = 'Hapus';
  deleteButton.addEventListener('click', function () {
    if (confirm('Data yang dihapus tidak dapat dikembalikan. Apakah anda yakin untuk menghapus data buku?')) {
      removeBookFromCompleted(bookObject.id);
    } else {
      return;
    }
  });

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('action');
  buttonContainer.append(undoButton, updateButton, deleteButton);
  article.append(buttonContainer);
  return article;
}

function addBook() {
  const textTitle = document.getElementById('inputBookTitle').value;
  const textAuthor = document.getElementById('inputBookAuthor').value;
  const textYear = document.getElementById('inputBookYear').value;
  const isCompleted = document.getElementById('inputBookIsComplete').checked;

  const generateID = generateId();
  const bookObject = generateBookObject(
    generateID, 
    textTitle, 
    textAuthor, 
    textYear, 
    isCompleted
  );

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) 
    return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function updateBook(bookId) {
  const bookTarget = findBook(Number(bookId));
  if (bookTarget == null) return;

  const updateTitle = document.getElementById('updateBookTitle').value;
  const updateAuthor = document.getElementById('updateBookAuthor').value;
  const updateYear = document.getElementById('updateBookYear').value;
  const isComplete = document.getElementById('updateBookIsComplete').checked;

  bookTarget.title = updateTitle;
  bookTarget.author = updateAuthor;
  bookTarget.year = updateYear;
  bookTarget.isCompleted = isComplete;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) 
    return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) 
    return;
  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function searchBooks() {
  const title = document.getElementById('searchBookTitle').value;
  const searchedBook = books.filter(function (book) {
    const bookName = book.title.toLowerCase();
    return bookName.includes(title.toLowerCase());
  });
  return searchedBook;
}
document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  const searchSubmit = document.getElementById('searchBook');
  const spanSubmitForm = document.querySelector('#inputBook span');
  const completeCheckbox = document.getElementById('inputBookIsComplete');

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  searchSubmit.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBooks();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  completeCheckbox.addEventListener('change', function () {
    spanSubmitForm.innerText = '';
    if (this.checked) {
      spanSubmitForm.innerText = 'Selesai dibaca';
    } else {
      spanSubmitForm.innerText = 'Belum selesai dibaca';
    }
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById('incompleteBookshelfList');
  uncompletedBookList.innerText = '';
  const completedBookList = document.getElementById('completeBookshelfList');
  completedBookList.innerText = '';

      for (const bookItem of searchBooks()) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) uncompletedBookList.append(bookElement);
        else completedBookList.append(bookElement);
    }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});