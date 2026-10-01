/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 * Tulis seluruh kode JavaScript kamu di sini.
 */

// TODO [Basic] Buat variabel array untuk menyimpan semua data transaksi, contoh: let transactions = []
let transactions = [];
let editingTransactionId = null;

// Simpan kata kunci pencarian yang lagi aktif
let currentSearchKeyword = '';

// Key Local Storage
const STORAGE_KEY = 'EXPENSE_TRACKER_TRANSACTIONS';

// Custom Event updated data dan ui 
const TRANSACTION_UPDATED_EVENT = 'transaction:updated';

// TODO [Basic] Buat fungsi untuk menghasilkan ID unik secara otomatis, contoh: gunakan +new Date()
function generateId() {
  return +new Date();
}

// Helper Func format angka to Rupiah
function formatToRupiah(numberValue) {
  return `Rp ${Number(numberValue).toLocaleString('id-ID')}`;
}

/**
 * ========================================================
 * Kriteria 1: Memanipulasi DOM untuk Form dan Daftar Transaksi
 * ========================================================
 */
// TODO [Basic] Ambil elemen kontainer incomeList dan expenseList dari DOM
const incomeListElement = document.getElementById('incomeList');
const expenseListElement = document.getElementById('expenseList');

const transactionFormElement = document.getElementById('transactionForm');
const transactionTitleInputElement = document.getElementById('transactionFormTitleInput');
const transactionAmountInputElement = document.getElementById('transactionFormAmountInput');
const transactionDateInputElement = document.getElementById('transactionFormDateInput');
const transactionTypeSelectElement = document.getElementById('transactionFormTypeSelect');
const transactionSubmitButtonElement = document.querySelector('[data-testid="transactionFormSubmitButton"]');
const formSectionHeadingElement = document.getElementById('form-heading');

// Elemen formulir dan input pencarian transaksi
const searchTransactionFormElement = document.getElementById('searchTransactionForm');
const searchTransactionInputElement = document.getElementById('searchTransactionFormTitleInput');

const balanceAmountElement = document.querySelector('.tracker-summary__balance-amount');
const incomeSummaryAmountElement = document.querySelector('.tracker-summary__stat-amount--income');
const expenseSummaryAmountElement = document.querySelector('.tracker-summary__stat-amount--expense');

/**
 * TODO [Basic]:
 * Buat fungsi untuk menampilkan (render) semua transaksi ke layar:
 *  - Kosongkan kontainer terlebih dahulu sebelum mengisi ulang
 *  - Gunakan perulangan, buat setiap elemen kartu dengan document.createElement()
 *  - Pastikan setiap elemen memiliki atribut data-testid yang sesuai (lihat panduan di rubrik)
 *  - Masukkan kartu ke kontainer yang tepat: income → incomeList, expense → expenseList
 */

// Fungsi untuk buat 1 kartu transaksi pakai document.createElement()
function createTransactionCardElement(transactionItem) {
  const isIncomeType = transactionItem.type === 'income';

  // Main Kontainer kartu transaksi
  const cardElement = document.createElement('div');
  cardElement.setAttribute('data-testid', 'transactionItem');
  cardElement.classList.add('tracker-transaction-item');

  // Ikon kecil penanda jenis transaksi, ambil warna dari style.css
  const iconElement = document.createElement('div');
  iconElement.classList.add('tracker-transaction-item__icon');

  if (isIncomeType) {
    iconElement.classList.add(
      'tracker-transaction-item__icon--income'
    );
    iconElement.textContent = '+';
  } else {
    iconElement.classList.add(
      'tracker-transaction-item__icon--expense'
    );
    iconElement.textContent = '-';
  }

  cardElement.appendChild(iconElement);

  // Kontainer detail (judul, nominal, tanggal, tipe)
  const detailElement = document.createElement('div');
  detailElement.classList.add('tracker-transaction-item__detail');

  // Judul transaksi
  const titleElement = document.createElement('h3');
  titleElement.setAttribute('data-testid', 'transactionItemTitle');
  titleElement.classList.add('tracker-transaction-item__title');
  titleElement.textContent = transactionItem.title;
  detailElement.appendChild(titleElement);

  // Tanggal transaksi
  const dateElement = document.createElement('p');
  dateElement.setAttribute('data-testid', 'transactionItemDate');
  dateElement.classList.add('tracker-transaction-item__date');
  dateElement.textContent = `Tanggal: ${transactionItem.date}`;
  detailElement.appendChild(dateElement);

  // Tipe transaksi (masuk/keluar)
  const typeElement = document.createElement('p');
  typeElement.setAttribute('data-testid', 'transactionItemType');
  typeElement.classList.add('tracker-transaction-item__date');

  if (isIncomeType) {
    typeElement.textContent = 'Tipe: Pemasukan';
  } else {
    typeElement.textContent = 'Tipe: Pengeluaran';
  }

  detailElement.appendChild(typeElement);
  cardElement.appendChild(detailElement);

  // Kontainer nominal + tombol aksi di kanan card
  const rightElement = document.createElement('div');
  rightElement.classList.add('tracker-transaction-item__right');

  // Nominal transaksi
  const amountElement = document.createElement('p');
  amountElement.setAttribute('data-testid', 'transactionItemAmount');
  amountElement.classList.add('tracker-transaction-item__amount');
  
  if (isIncomeType) {
    amountElement.classList.add(
      'tracker-transaction-item__amount--income'
    );
  } else {
    amountElement.classList.add(
      'tracker-transaction-item__amount--expense'
    );
  }
  
  amountElement.textContent = `Nominal: Rp${transactionItem.amount}`;
  rightElement.appendChild(amountElement);

  // Kontainer button aksi (Edit, Ubah Tipe, Hapus)
  const actionsElement = document.createElement('div');
  actionsElement.classList.add('tracker-transaction-item__actions');

  // Tombol Edit refill formulir
  const editButtonElement = document.createElement('button');
  editButtonElement.setAttribute('data-testid', 'transactionItemEditButton');
  editButtonElement.classList.add('tracker-transaction-item__btn');
  editButtonElement.type = 'button';
  editButtonElement.textContent = 'Edit';
  editButtonElement.addEventListener('click', function () {
    startEditTransaction(transactionItem.id);
  });
  actionsElement.appendChild(editButtonElement);

  // Tombol Ubah Tipe (tukar income/expense)
  const editTypeButtonElement = document.createElement('button');
  editTypeButtonElement.setAttribute('data-testid', 'transactionItemEditTypeButton');
  editTypeButtonElement.classList.add('tracker-transaction-item__btn');
  editTypeButtonElement.type = 'button';
  editTypeButtonElement.textContent = 'Ubah Tipe';
  editTypeButtonElement.addEventListener('click', function () {
    toggleTransactionType(transactionItem.id);
  });
  actionsElement.appendChild(editTypeButtonElement);

  // Tombol Hapus transaksi dari ui dan localStorage
  const deleteButtonElement = document.createElement('button');
  deleteButtonElement.setAttribute('data-testid', 'transactionItemDeleteButton');
  deleteButtonElement.classList.add('tracker-transaction-item__btn');
  deleteButtonElement.type = 'button';
  deleteButtonElement.textContent = 'Hapus';
  deleteButtonElement.addEventListener('click', function () {
    deleteTransaction(transactionItem.id);
  });
  actionsElement.appendChild(deleteButtonElement);

  rightElement.appendChild(actionsElement);
  cardElement.appendChild(rightElement);

  return cardElement;
}
 
/*
  Func show all transaksi ke ui (kontainer )
  Kontainer dikosongi dulu agar tidak duplikat card, refiil sesuai data filter transaksi
*/
function renderTransactions() {
  incomeListElement.innerHTML = '';
  expenseListElement.innerHTML = '';

  const keywordLowerCase = currentSearchKeyword.trim().toLowerCase();

  let transactionsToRender = transactions;
  if (keywordLowerCase !== '') {
    transactionsToRender = transactions.filter(
      function (transactionItem) {
        return transactionItem.title
          .toLowerCase()
          .includes(keywordLowerCase);
      }
    );
  }

  transactionsToRender.forEach(function (transactionItem) {
    const cardElement = createTransactionCardElement(transactionItem);

    if (transactionItem.type === 'income') {
      incomeListElement.appendChild(cardElement);
    } else {
      expenseListElement.appendChild(cardElement);
    }
  });
}

// TODO [Basic] Tambahkan event listener 'submit' pada form, panggil e.preventDefault() di dalamnya
// TODO [Basic] Di dalam handler submit, ambil nilai input lalu tambahkan sebagai objek transaksi baru ke array

transactionFormElement.addEventListener('submit', function (submitEvent) {
  submitEvent.preventDefault();

  const titleValue = transactionTitleInputElement.value.trim();
  const amountValue = Number(transactionAmountInputElement.value);
  const dateValue = transactionDateInputElement.value;
  const typeValue = transactionTypeSelectElement.value;

/**
 * TODO [Skilled]:
 * Tambahkan validasi input sebelum menyimpan data:
 *  - Tampilkan alert() dan hentikan proses jika judul kosong
 *  - Tampilkan alert() dan hentikan proses jika nominal kurang dari 1
 */

  // Validasi judul tak boleh empty
  if (titleValue === '') {
    alert('Judul transaksi tidak boleh kosong.');
    return;
  }

  // Validasi nominal transaksi min Rp 1
  if (isNaN(amountValue) || amountValue < 1) {
    alert('Nominal uang tidak boleh kurang dari 1 Rupiah.');
    return;
  }

  if (editingTransactionId !== null) {
    // Update: Cari transaksi yang lagi diedit, lalu timpa data
    const targetIndex = transactions.findIndex(function (transactionItem) {
      return transactionItem.id === editingTransactionId;
    });

    if (targetIndex !== -1) {
      transactions[targetIndex] = {
        id: editingTransactionId,
        title: titleValue,
        amount: amountValue,
        date: dateValue,
        type: typeValue,
      };
    }
  } else {
    // Tambah: buat objek transaksi baru konsisten
    const newTransactionObject = {
      id: generateId(),
      title: titleValue,
      amount: amountValue,
      date: dateValue,
      type: typeValue,
    };

    transactions.push(newTransactionObject);
  }

  // Formulir back to "Tambah" usai update
  resetTransactionFormToAddMode();

  // Save perubahan, kirim sinyal update ui
  saveTransactionsToStorage();
  document.dispatchEvent(new Event(TRANSACTION_UPDATED_EVENT));
});

/**
 * TODO [Advanced]:
 * Setiap kali data transaksi berubah, perbarui Panel Dasbor:
 *  - Hitung total pemasukan, total pengeluaran, dan saldo (pemasukan - pengeluaran)
 *  - Tampilkan hasilnya ke elemen yang sesuai di HTML
 */

// Fungsi rekalkulasi dan show summary finansial 
function updateDashboardSummary() {
  const totalIncomeAmount = transactions
    .filter(function (transactionItem) {
      return transactionItem.type === 'income';
    })
    .reduce(function (accumulatedAmount, transactionItem) {
      return accumulatedAmount + transactionItem.amount;
    }, 0);

  const totalExpenseAmount = transactions
    .filter(function (transactionItem) {
      return transactionItem.type === 'expense';
    })
    .reduce(function (accumulatedAmount, transactionItem) {
      return accumulatedAmount + transactionItem.amount;
    }, 0);

  const currentBalanceAmount = totalIncomeAmount - totalExpenseAmount;

  balanceAmountElement.textContent = formatToRupiah(currentBalanceAmount);
  incomeSummaryAmountElement.textContent = formatToRupiah(totalIncomeAmount);
  expenseSummaryAmountElement.textContent = formatToRupiah(totalExpenseAmount);
}


/**
 * ========================================================
 * Kriteria 2: Mengelola Penyimpanan Data (Web Storage API)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Data transaksi disimpan ke localStorage menggunakan JSON.stringify(), dan dimuat kembali saat halaman dibuka menggunakan JSON.parse().
 *  - Tombol "Hapus" berfungsi: transaksi yang dihapus langsung hilang dari layar dan dari localStorage.
 */

// Fungsi cek support localStorage browser
function isLocalStorageAvailable() {
  if (typeof Storage !== 'undefined') {
    return true;
  }
  return false;
}

// Save semua data ke localStorage (teks JSON)
function saveTransactionsToStorage() {
  if (!isLocalStorageAvailable()) {
    return;
  }

  const serializedTransactions = JSON.stringify(transactions);
  localStorage.setItem(STORAGE_KEY, serializedTransactions);
}

// Re-load data transaksi dari localStorage
function loadTransactionsFromStorage() {
  if (!isLocalStorageAvailable()) {
    return;
  }

  const serializedTransactions = localStorage.getItem(STORAGE_KEY);

  if (serializedTransactions === null) {
    return;
  }

  const parsedTransactions = JSON.parse(serializedTransactions);
  if (Array.isArray(parsedTransactions)) {
    transactions = parsedTransactions;
  } else {
    transactions = [];
  }
}

// Fungsi hapus 1 transaksi per id
function deleteTransaction(transactionId) {
  transactions = transactions.filter(function (transactionItem) {
    return transactionItem.id !== transactionId;
  });

  // Transaksi diedit terhapus, balik form ke 'Tambah'
  if (editingTransactionId === transactionId) {
    resetTransactionFormToAddMode();
  }

  saveTransactionsToStorage();
  document.dispatchEvent(new Event(TRANSACTION_UPDATED_EVENT));
}

/**
 * TODO [Skilled]:
 * Tombol "Edit" berfungsi: saat ditekan, formulir (#transactionForm) secara otomatis terisi dengan data transaksi yang dipilih.
 *  - Pengguna dapat mengubah data lalu menyimpan perubahan.
 *  - Formulir kembali ke mode "Tambah" setelah pembaruan selesai.
 */

// Isi form data transaksi yang dipilih, mode 'Edit' aktif
function startEditTransaction(transactionId) {
  const targetTransaction = transactions.find(function (transactionItem) {
    return transactionItem.id === transactionId;
  });

  if (!targetTransaction) {
    return;
  }

  editingTransactionId = targetTransaction.id;

  transactionTitleInputElement.value = targetTransaction.title;
  transactionAmountInputElement.value = targetTransaction.amount;
  transactionDateInputElement.value = targetTransaction.date;
  transactionTypeSelectElement.value = targetTransaction.type;

  transactionSubmitButtonElement.textContent = 'Perbarui';
  formSectionHeadingElement.textContent = 'Perbarui Pencatatan';
  transactionTitleInputElement.focus();
}

// Return formulir ke mode 'Tambah' usai tambah/edit
function resetTransactionFormToAddMode() {
  editingTransactionId = null;
  transactionFormElement.reset();
  transactionSubmitButtonElement.textContent = 'Simpan';
  formSectionHeadingElement.textContent = 'Tambah Pencatatan Baru';
}

/**
 * TODO [Advanced]:
 * Gunakan Custom Event sebagai penghubung antara perubahan data dan pembaruan tampilan:
 *  - Kirim sinyal dengan document.dispatchEvent(new Event('transaction:updated')) setiap kali data berubah
 *  - Pasang satu listener untuk event tersebut yang memanggil fungsi render dan update dasbor
 */

// 1 listener terpusat merespons tiap perubahan data
document.addEventListener(TRANSACTION_UPDATED_EVENT, function () {
  renderTransactions();
  updateDashboardSummary();
});

/**
 * ========================================================
 * Kriteria 3: Fitur Interaktif (Pindah Kategori dan Pencarian)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Tambahkan tombol "Ubah Tipe" pada setiap kartu transaksi:
 *  - Saat diklik, ubah tipe transaksi: 'income' → 'expense' atau 'expense' → 'income'
 *  - Simpan perubahan ke localStorage dan perbarui tampilan
 */

// Balik tipe transaksi (income <-> expense) per id, simpan dan render ulang
function toggleTransactionType(transactionId) {
  const targetTransaction = transactions.find(function (transactionItem) {
    return transactionItem.id === transactionId;
  });

  if (!targetTransaction) {
    return;
  }

  if (targetTransaction.type === 'income') {
    targetTransaction.type = 'expense';
  } else {
    targetTransaction.type = 'income';
  }

  saveTransactionsToStorage();
  document.dispatchEvent(new Event(TRANSACTION_UPDATED_EVENT));
}

/**
 * TODO [Skilled]:
 * Tambahkan event listener 'input' pada kolom pencarian:
 *  - Filter array transaksi berdasarkan kecocokan kata kunci dengan judul transaksi
 *  - Tampilkan hanya transaksi yang judulnya mengandung kata kunci tersebut
 */

// Tiap kali user ketik di search bar, simpan keyword, lalu render ulang daftar
searchTransactionInputElement.addEventListener('input', function (inputEvent) {
  currentSearchKeyword = inputEvent.target.value;
  renderTransactions();
});

// Cegah reload halaman pas tombol "Cari" diklik
searchTransactionFormElement.addEventListener('submit', function (submitEvent) {
  submitEvent.preventDefault();
  currentSearchKeyword = searchTransactionInputElement.value;
  renderTransactions();
});

/**
 * Fitur Tambahan: Mode Tema 
 * Klik elemen .tracker-header__avatar
 * Tema diterapkan dengan menandai atribut data-theme di elemen <html>
 * Seluruh definisi warna dan efek visual tiap tema ada di style.css
 * Preferensi tema disimpan di localStorage
 */

// Key localStorage untuk simpan aktif tema
const THEME_STORAGE_KEY = 'EXPENSE_TRACKER_THEME';

// Urutan tema saat klik logo avatar (Default → Gelap → Universe -> repeat)
const THEME_CYCLE_ORDER = ['default', 'dark', 'universe'];

// Trigger perubahan tema
const headerAvatarElement = document.querySelector('.tracker-header__avatar');

/**
 * Menerapkan 1 nama tema
 */
function applyTheme(themeName) {
  if (themeName === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeName);
  }

  localStorage.setItem(THEME_STORAGE_KEY, themeName);
}

// Load saved tema di localStorage as laman pertama pas browser dibuka
function loadSavedTheme() {
  const savedThemeName = localStorage.getItem(THEME_STORAGE_KEY);
  const isValidThemeName = THEME_CYCLE_ORDER.includes(savedThemeName);

  if (isValidThemeName) {
    applyTheme(savedThemeName);
  } else {
    applyTheme('default');
  }
}

// Pindah ke tema selanjutnya
function switchToNextTheme() {
  const currentThemeName = localStorage.getItem(THEME_STORAGE_KEY) || 'default';
  const currentThemeIndex = THEME_CYCLE_ORDER.indexOf(currentThemeName);
  const nextThemeIndex = (currentThemeIndex + 1) % THEME_CYCLE_ORDER.length;

  applyTheme(THEME_CYCLE_ORDER[nextThemeIndex]);
}

headerAvatarElement.addEventListener('click', switchToNextTheme);

/**
 * TODO [Advanced]:
 * Pastikan fitur pencarian berjalan dengan baik di semua kondisi:
 *  - Saat kolom pencarian dikosongkan, tampilkan kembali seluruh daftar transaksi
 */

loadTransactionsFromStorage();
loadSavedTheme();
document.dispatchEvent(new Event(TRANSACTION_UPDATED_EVENT));