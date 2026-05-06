import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCs6ZoVvXI9oAlosX7LXc8wj8Ij2NU0hAE",
    authDomain: "kas-rohis-7574a.firebaseapp.com",
    projectId: "kas-rohis-7574a",
    storageBucket: "kas-rohis-7574a.firebasestorage.app",
    messagingSenderId: "539974548681",
    appId: "1:539974548681:web:fbd414598ae4ccbf496118",
    databaseURL: "https://kas-rohis-7574a-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const databaseRef = ref(db, 'pembayaran_kas');

let dataLokal = {};
let adminStatus = false;

const listNama = ["anditenrilengka", "muhammad sa'ad hamzah", "nurul alifiyatul aswan", "naswa", "saskia", "syahrul", "evi agnesia", "melinda saputri", "andi syahrul yudiono", "Almira ramadhani", "reski sulistia", "andi ratu bilqis", "andi muh luqman", "arkan fikri", "besse nurfadillah", "fitria", "putriani", "andi fadhil rumpang", "muh. resky wijaya", "muh fikran", "muh fauzan hidayatullah", "nurul sabila ramadhani", "nur asmil hasanah", "febri aulya kasunaya", "muh. iqbal", "yuliana", "Muh ilham", "Aldi supriadi", "zahrah rahmadhani"].sort();
const listBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// Inisialisasi Dropdown
const selNama = document.getElementById('selectNama');
listNama.forEach(n => selNama.innerHTML += `<option value="${n}">${n.toUpperCase()}</option>`);
const selBulan = document.getElementById('pilihBulan');
listBulan.forEach((b, i) => selBulan.innerHTML += `<option value="${i}">${b}</option>`);

// Ambil Data Firebase
onValue(databaseRef, (snapshot) => {
    const data = snapshot.val();
    if (data && typeof data === 'object') {
        dataLokal = data;
        document.getElementById('dbStatus').innerText = "Cloud Online ✅";
        document.getElementById('dbStatus').className = "text-[10px] font-bold text-green-500 uppercase tracking-widest";
    } else {
        let init = {};
        listNama.forEach(n => init[n] = listBulan.map(b => ({ namaBulan: b, terbayar: 0 })));
        set(databaseRef, init);
    }
    renderTabel();
});

// Tombol-tombol (Event Listeners)
document.getElementById('adminBtn').addEventListener('click', () => {
    const pass = prompt("Password Admin (SYAHRUL):");
    if (pass === "KAS ROHIS") {
        adminStatus = true;
        document.getElementById('adminBtn').innerText = "ADMIN: SYAHRUL";
        document.getElementById('adminBtn').classList.replace('bg-slate-200', 'bg-green-500');
        document.getElementById('adminBtn').classList.add('text-white');
        alert("Login Berhasil!");
    } else { alert("Salah!"); }
});

document.getElementById('btnBukaInput').addEventListener('click', () => {
    if(!adminStatus) return alert("Login Admin dulu, Rul!");
    document.getElementById('modalBox').classList.remove('hidden');
});

document.getElementById('btnBatal').addEventListener('click', () => {
    document.getElementById('modalBox').classList.add('hidden');
});

document.getElementById('selectNama').addEventListener('change', renderTabel);

document.getElementById('btnSimpan').addEventListener('click', () => {
    if(!adminStatus) return;

    const targetNama = document.getElementById('selectNama').value;
    const targetBulan = document.getElementById('pilihBulan').value;
    const inputDuit = document.getElementById('nominalUang');
    const jumlah = parseInt(inputDuit.value);

    if(!jumlah || jumlah <= 0) return alert("Masukkan nominal!");

    dataLokal[targetNama][targetBulan].terbayar += jumlah;
    
    set(databaseRef, dataLokal).then(() => {
        alert("Berhasil!");
        document.getElementById('modalBox').classList.add('hidden');
        inputDuit.value = '';
    }).catch(e => alert("Error: " + e.message));
});

function renderTabel() {
    const namaAktif = document.getElementById('selectNama').value;
    const dataNama = dataLokal[namaAktif] || [];
    const container = document.getElementById('isiTabel');
    container.innerHTML = '';

    dataNama.forEach(item => {
        const sisa = 10000 - item.terbayar;
        let status = "BELUM", sClass = "status-belum";
        if(item.terbayar >= 10000) { status = "LUNAS"; sClass = "status-lunas"; }
        else if(item.terbayar > 0) { status = "DICICIL"; sClass = "status-cicil"; }

        container.innerHTML += `<tr><td class="p-4 font-bold">${item.namaBulan}</td><td class="p-4 text-right">Rp ${item.terbayar.toLocaleString()}</td><td class="p-4 text-right text-rose-500">Rp ${Math.max(0, sisa).toLocaleString()}</td><td class="p-4 text-center"><span class="px-3 py-1 rounded-full text-[9px] font-black border ${sClass}">${status}</span></td></tr>`;
    });
}
