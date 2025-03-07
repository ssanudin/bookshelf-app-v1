document.addEventListener("DOMContentLoaded", function() {
  // Create shelf object
  const myshelf = new Shelf();
  // Display books on shelf
  myshelf.displayBook();

  // Add event listener to the add book button
  document.querySelector("#bookFormIsComplete").addEventListener("change", function() {
    // Chamge button text based on isComplete
    if (document.querySelector("#bookFormIsComplete").checked) {
      document.querySelector("#bookFormSubmit span").textContent = "Selesai dibaca";
    } else {
      document.querySelector("#bookFormSubmit span").textContent = "Belum selesai dibaca";
    }
  });

  // Add event listener to the add form submit
  document.querySelector("#bookForm").addEventListener("submit", function (e) {
    e.preventDefault();
    
    // Get the data from the form
    const { title, author, year, isComplete, editId } = getInputNewBook();
    if (title && author && year) {
      // Add book to the shelf object
      myshelf.addBook(title, author, year, isComplete, editId);
      console.log(myshelf)
    }
  });

  // Add event listener to the search submit
  document.querySelector("#searchBook").addEventListener("submit", function (e) {
    e.preventDefault();

    // Get the data from the search form and search it
    const search = document.querySelector("#searchBookTitle").value;
    myshelf.searchBook(search);
  });

  // Add event listener to the body to listen to the action buttons
  document.querySelector("body").addEventListener("click", function(e) {
    const _button = e.target;
    const _classList = _button.classList;
    
    if (_classList.contains("incompleteBook") || _classList.contains("completeBook")) {
      // Move the book to the other shelf
      const bookid = _button.dataset.bookid;
      const moveTo = _classList.contains("incompleteBook") ? "completeBookList" : "incompleteBookList";
      myshelf.moveBook(bookid, moveTo, _button);
    } else if (_classList.contains("deleteBook")) {
      // Delete the book
      const bookid = _button.dataset.bookid;
      myshelf.deleteBook(bookid);
    } else if (_classList.contains("editBook")) {
      // Edit the book
      const bookid = _button.dataset.bookid;
      const book = myshelf.getBookById(bookid);
      setInputNewBook(book);
      window.scrollTo({ top: 0, behavior: "smooth"});
    }
  });

  console.log(myshelf);
});

// Get data from the add form
function getInputNewBook() {
  const title = document.querySelector("#bookFormTitle").value;
  const author = document.querySelector("#bookFormAuthor").value;
  const year = document.querySelector("#bookFormYear").value;
  const isComplete = document.querySelector("#bookFormIsComplete").checked;
  const editId = document.querySelector("#bookFormEditId").value;

  if (title && author && year) {
    return { title, author, year, isComplete, editId };
  }

  alert("Beberapa field input invalid, pastikan Anda telah mengisi semua field.")
  return {};
}

// Set data to the add form
function setInputNewBook(book) {
  document.querySelector("#bookFormTitle").value = book.title;
  document.querySelector("#bookFormAuthor").value = book.author;
  document.querySelector("#bookFormYear").value = book.year;
  document.querySelector("#bookFormIsComplete").checked = book.isComplete;
  document.querySelector("#bookFormSubmit span").textContent = book.isComplete ? "Selesai dibaca" : "Belum selesai dibaca";
  document.querySelector("#bookFormEditId").value = book.id;
}

// Shelf class
class Shelf {
  // Local storage key for the app
  static LOCAL_KEY = "bookshelf_app";
  
  // Constructor
  constructor() {
    this.books = this.#getLocal();
  }

  // Display book to the shelf
  displayBook(bookId=-1) {
    if (bookId === -1) {
      // Display all the books
      document.querySelector("#completeBookList").innerHTML = "";
      document.querySelector("#incompleteBookList").innerHTML = "";
      
      for (const _bookId in this.books) {
        const bookElement = this.#createBookElement(this.books[_bookId]);
        if (bookElement) {
          const shelf = this.books[_bookId].isComplete ? "#completeBookList" : "#incompleteBookList";
          document.querySelector(shelf).append(bookElement);
        }
      }
    } else {
      // Display a book
      if (this.books[bookId]) {
        const bookElement = this.#createBookElement(this.books[bookId]);
        if (bookElement) {
          const shelf = this.books[bookId].isComplete ? "#completeBookList" : "#incompleteBookList";
          document.querySelector(shelf).append(bookElement);
        }
      }
    }
  }

  // Search books by title
  searchBook(searchByTitle) {
    if (searchByTitle) {
      // Filter books by title
      const searchResult = Object.values(this.books).filter(book => book.title.toLowerCase().includes(searchByTitle.toLowerCase()));

      // Empty the book list
      document.querySelector("#completeBookList").innerHTML = "";
      document.querySelector("#incompleteBookList").innerHTML = "";
      // Display the search result
      for (const book of searchResult) {
        this.displayBook(book.id);
      }
    } else {
      // Display all books when the search value is empty
      this.displayBook();
    }

    // Scroll to the search element
    const element = document.getElementById("search");
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  
  // Add a book to the shelf
  addBook(title, author, year, isComplete, editId) {
    // Set the id of the book
    const id = editId || this.#generateId();
    // Create a new or edit book
    this.books[id] = { id, title, author, year: parseInt(year), isComplete };
    // Save the data to the local storage
    this.#saveLocal(this.books);
    // Display the book
    this.displayBook(editId ? -1 : id);
    // Reset the form
    this.#resetBookForm();

    // Scroll to the book list
    const element = document.getElementById(isComplete ? "completeBookList" : "incompleteBookList");
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Get the book by the id
  getBookById(bookId) {
    return this.books[bookId];
  }

  // Move a book to the other shelf
  moveBook(bookId, to, btnElement) {
    if (this.books[bookId]) {
      // Change the book isComplete status
      this.books[bookId].isComplete = !this.books[bookId].isComplete;
      // Save the data to the local storage
      this.#saveLocal(this.books);
  
      // Get book element
      const bookElement = document.querySelector(`.bookItem[data-bookid="${bookId}"]`);
      // Update the button property
      btnElement.textContent = to === "completeBookList" ? "Belum selesai dibaca" : "Selesai dibaca";
      btnElement.className = "";
      btnElement.classList.add(to === "completeBookList" ? "completeBook" : "incompleteBook");
      
      // Move the book to the other shelf
      document.getElementById(to).appendChild(bookElement);
    }
  }

  // Delete a book
  deleteBook(bookId) {
    if (bookId in this.books) {
      // Delete the book from the books object
      delete this.books[bookId];
      // Save the data to the local storage
      this.#saveLocal(this.books);
      // Remove the book element
      document.querySelector(`.bookItem[data-bookid="${bookId}"]`).remove();
    }
  }

  // Create a new book element
  #createBookElement({ id, title, author, year, isComplete }) {
    if (id && title && author && year) {
      // Create book title element
      const titleBook = document.createElement("h3");
      titleBook.textContent = title;
      titleBook.dataset.testid = "bookItemTitle";
      // Create book author element
      const authorBook = document.createElement("p");
      authorBook.innerHTML = "Penulis: <strong>" + author + "</strong>";
      authorBook.dataset.testid = "bookItemAuthor";
      // Create book year element
      const yearBook = document.createElement("p");
      yearBook.innerHTML = "Tahun: <strong>" + year + "</strong>";
      yearBook.dataset.testid = "bookItemYear";
      // Create book status button element
      const in_completeBtn = document.createElement("button");
      in_completeBtn.textContent = isComplete ? "Belum selesai dibaca" : "Selesai dibaca";
      in_completeBtn.classList.add(isComplete ? "completeBook" : "incompleteBook");
      in_completeBtn.dataset.testid = "bookItemIsCompleteButton";
      in_completeBtn.dataset.bookid = id;
      // Create book delete button element
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Hapus Buku";
      deleteBtn.classList.add("deleteBook");
      deleteBtn.dataset.testid = "bookItemDeleteButton";
      deleteBtn.dataset.bookid = id;
      // Create book edit button element
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit Buku";
      editBtn.classList.add("editBook");
      editBtn.dataset.testid = "bookItemEditButton";
      editBtn.dataset.bookid = id;
      // Create buttons container element
      const action = document.createElement("div");
      action.classList.add("action");
      // Append buttons elements to the action container
      action.appendChild(in_completeBtn);
      action.appendChild(deleteBtn);
      action.appendChild(editBtn);
  
      // Create book container element
      const bookElement = document.createElement("div");
      bookElement.dataset.bookid = id;
      bookElement.dataset.testid = "bookItem";
      bookElement.classList.add("bookItem");
      // Append title, author, year, and action elements to the book container
      bookElement.appendChild(titleBook);
      bookElement.appendChild(authorBook);
      bookElement.appendChild(yearBook);
      bookElement.appendChild(action);
  
      return bookElement;
    }

    return null;
  }

  // Reset the add form inputs
  #resetBookForm() {
    const bookForm = document.querySelector("#bookForm");
    bookForm.reset();
    document.querySelector("input[type='hidden']").value = "";
  }

  // Generate a new id for the book
  #generateId() {
    return +new Date();
  }

  // Check if the browser supports the Storage API
  #isStorageExist() {
    if (typeof (Storage) === "undefined") {
        return false;
    }
    return true;
  }

  // Get the stored books from local storage
  #getLocal() {
    const localBooks = {}
    if (this.#isStorageExist()) {
      const booksLocalData = localStorage.getItem(this.LOCAL_KEY);
      const booksData = JSON.parse(booksLocalData);
  
      if (booksData) {
        for (const bookId in booksData) {
          if (!localBooks[bookId]) {
            booksData[bookId].year = parseInt(booksData[bookId].year);
            localBooks[bookId] = booksData[bookId];
          }
        }
      }
    }

    return localBooks
  }

  // Save the books to local storage
  #saveLocal(books) {
    if (this.#isStorageExist()) {
      const booksData = JSON.stringify(books);
      localStorage.setItem(this.LOCAL_KEY, booksData);
    }
  }
}