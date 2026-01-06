'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('doctor'); // 'doctor' | 'patient'
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          🏥 <span>EHR Blockchain System</span>
        </h1>
        <ConnectButton />
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center mt-20 space-y-4">
          <div className="text-6xl">🔐</div>
          <h2 className="text-xl text-gray-600 font-medium">Silakan hubungkan Wallet untuk melanjutkan</h2>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* Tabs Navigation */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('doctor')}
              className={`px-8 py-3 rounded-full font-bold transition-all shadow-sm ${
                activeTab === 'doctor' 
                  ? 'bg-blue-600 text-white shadow-blue-200 ring-2 ring-blue-300' 
                  : 'bg-white text-gray-500 hover:bg-gray-100'
              }`}
            >
              👨‍⚕️ Portal Dokter
            </button>
            <button
              onClick={() => setActiveTab('patient')}
              className={`px-8 py-3 rounded-full font-bold transition-all shadow-sm ${
                activeTab === 'patient' 
                  ? 'bg-green-600 text-white shadow-green-200 ring-2 ring-green-300' 
                  : 'bg-white text-gray-500 hover:bg-gray-100'
              }`}
            >
              🤒 Portal Pasien
            </button>
          </div>

          {/* Main Content Area */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            {activeTab === 'doctor' ? <DoctorView /> : <PatientView userAddress={address} />}
          </div>
        </div>
      )}
    </main>
  );
}

// ==========================================
// 👨‍⚕️ KOMPONEN DOKTER
// ==========================================
function DoctorView() {
  const { writeContract } = useWriteContract();
  
  // State Input Data Baru
  const [patientAddr, setPatientAddr] = useState('');
  const [recordType, setRecordType] = useState('');
  const [cid, setCid] = useState('');
  
  // State Pencarian & View
  const [viewMode, setViewMode] = useState('inbox'); // 'inbox' | 'search' | 'create'
  const [searchPatientAddr, setSearchPatientAddr] = useState('');

  // Fungsi Tambah Record
  const handleAddRecord = async () => {
    if(!patientAddr || !cid || !recordType) return alert("Mohon lengkapi semua data");
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'addRecord',
        args: [patientAddr, cid, recordType],
      });
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim transaksi');
    }
  };

  return (
    <div>
      {/* Sub-Navigasi Dokter */}
      <div className="flex space-x-2 mb-6 border-b pb-4">
        <button 
          onClick={() => setViewMode('inbox')}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${viewMode === 'inbox' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          📥 Inbox Medis (Shared)
        </button>
        <button 
          onClick={() => setViewMode('search')}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${viewMode === 'search' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          🔍 Cari Pasien
        </button>
        <button 
          onClick={() => setViewMode('create')}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${viewMode === 'create' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          📝 Input Data Baru
        </button>
      </div>

      {/* VIEW: INBOX MEDIS (FITUR BARU) */}
      {viewMode === 'inbox' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-4">
             <h3 className="text-xl font-bold text-gray-800">📂 Berkas Dibagikan ke Saya</h3>
             <p className="text-sm text-gray-500">Daftar rekam medis yang pasien telah berikan akses kepada Anda.</p>
          </div>
          <DoctorSharedInbox />
        </div>
      )}

      {/* VIEW: INPUT DATA */}
      {viewMode === 'create' && (
        <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="border-b pb-4 mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">📝 Input Rekam Medis</h3>
            <p className="text-sm text-gray-500">Buat data baru untuk pasien. Hak akses otomatis milik pasien.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Pasien</label>
              <input type="text" placeholder="0x..." className="w-full p-3 border border-gray-300 rounded-lg text-black" onChange={(e) => setPatientAddr(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosa / Tipe</label>
              <input type="text" placeholder="Contoh: Rontgen, PCR" className="w-full p-3 border border-gray-300 rounded-lg text-black" onChange={(e) => setRecordType(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IPFS CID (File Hash)</label>
              <input type="text" placeholder="QmHash..." className="w-full p-3 border border-gray-300 rounded-lg text-black" onChange={(e) => setCid(e.target.value)} />
            </div>
            <button onClick={handleAddRecord} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md">Submit ke Blockchain</button>
          </div>
        </div>
      )}

      {/* VIEW: PENCARIAN */}
      {viewMode === 'search' && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="border-b pb-4 mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">🔍 Cari Data Pasien Manual</h3>
            <p className="text-sm text-gray-500">Masukkan wallet pasien untuk melihat daftar record mereka.</p>
          </div>
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Masukkan Address Pasien (0x...)"
              className="flex-grow p-3 border border-gray-300 rounded-lg text-gray-900 text-sm"
              onChange={(e) => setSearchPatientAddr(e.target.value)}
            />
          </div>
          <DoctorPatientRecordList patientAddress={searchPatientAddr} />
        </div>
      )}
    </div>
  );
}

// Sub-Komponen: Inbox untuk Dokter (Event Indexer)
function DoctorSharedInbox() {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const [sharedRecords, setSharedRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Fungsi fetch dipisahkan agar bisa dipanggil ulang (Refresh)
    const fetchEvents = async () => {
        if (!address || !publicClient) return;
        setLoading(true);
        try {
            // 1. Cek Validitas Kontrak di Jaringan
            const code = await publicClient.getBytecode({ address: CONTRACT_ADDRESS });
            if (!code || code === '0x') {
                console.warn("Contract not deployed at this address!");
                alert("Kontrak tidak ditemukan di alamat ini. Pastikan node berjalan dan address di constants.js benar.");
                setLoading(false);
                return;
            }

            console.log("Fetching logs for doctor:", address);
            
            // 2. Ambil Log
            const logs = await publicClient.getLogs({
                address: CONTRACT_ADDRESS,
                event: parseAbiItem('event AccessGranted(uint256 indexed recordId, address indexed patient, address indexed doctor)'),
                fromBlock: 0n // Menggunakan BigInt 0 untuk 'earliest'
            });

            console.log("Total Raw logs found:", logs.length);

            // 3. Filter Manual di Sisi Klien (Lebih Aman)
            const myLogs = logs.filter(log => 
                log.args && 
                log.args.doctor && 
                log.args.doctor.toLowerCase() === address.toLowerCase()
            );

            console.log("Filtered logs for me:", myLogs.length);

            // 4. Format data & Hapus duplikat
            const uniqueRecords = [];
            const seenIds = new Set();

            for (let i = myLogs.length - 1; i >= 0; i--) {
                const log = myLogs[i];
                const id = log.args.recordId.toString();
                
                if (!seenIds.has(id)) {
                    seenIds.add(id);
                    uniqueRecords.push({
                        id: id,
                        patient: log.args.patient,
                        expiry: "Active" 
                    });
                }
            }
            setSharedRecords(uniqueRecords);
        } catch (error) {
            console.error("Gagal fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    // Scan Event saat komponen di-mount atau address berubah
    useEffect(() => {
        fetchEvents();
    }, [address, publicClient]);

    return (
        <div className="flex gap-6">
            {/* KIRI: List ID */}
            <div className="w-1/3 bg-white border border-gray-200 rounded-lg h-[400px] flex flex-col">
                <div className="p-3 bg-gray-100 border-b font-bold text-gray-600 text-sm flex justify-between items-center">
                    <span>Daftar ID ({sharedRecords.length})</span>
                    <button 
                        onClick={fetchEvents} 
                        disabled={loading}
                        className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                        {loading ? '...' : 'Refresh'}
                    </button>
                </div>
                
                <div className="overflow-y-auto flex-grow">
                    {loading && sharedRecords.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">Scanning Blockchain...</div>
                    ) : sharedRecords.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">
                            <p>Belum ada data.</p>
                            <p className="text-xs mt-2">Pastikan Pasien sudah memberikan akses ke wallet ini.</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {sharedRecords.map((rec) => (
                                <button 
                                    key={rec.id}
                                    onClick={() => setSelectedRecord(rec.id)}
                                    className={`w-full text-left p-3 hover:bg-blue-50 transition flex flex-col ${selectedRecord === rec.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                                >
                                    <span className="font-bold text-gray-700">Record #{rec.id}</span>
                                    {/* UPDATE: Menampilkan alamat full dengan break-all */}
                                    <span className="text-xs text-gray-500 break-all">Pasien: {rec.patient}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* KANAN: Detail */}
            <div className="w-2/3 bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center">
                {selectedRecord ? (
                    <div className="w-full">
                         <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Detail Record #{selectedRecord}</h4>
                         <DoctorRecordCard 
                            recordId={selectedRecord} 
                            showDetailed={true}
                            patientAddress={sharedRecords.find(r => r.id === selectedRecord)?.patient}
                         />
                    </div>
                ) : (
                    <div className="text-center text-gray-400">
                        <p className="text-4xl mb-2">👈</p>
                        <p>Pilih salah satu ID dari daftar di kiri <br/>untuk melihat isi file.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-Komponen: List Record untuk Pencarian Manual
function DoctorPatientRecordList({ patientAddress }) {
    const { data: recordIds, isPending } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getPatientRecordIds',
        args: [patientAddress],
        query: { enabled: !!patientAddress && patientAddress.startsWith('0x') && patientAddress.length === 42 }
    });

    if (!patientAddress) return <p className="text-gray-400 text-center italic">Menunggu input address...</p>;
    if (isPending) return <p className="text-blue-500 text-center animate-pulse">Sedang mencari data blockchain...</p>;
    if (!recordIds || recordIds.length === 0) return <p className="text-gray-500 text-center">Tidak ada rekam medis ditemukan untuk pasien ini.</p>;

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Ditemukan {recordIds.length} Record:</h4>
            {recordIds.map((id) => (
                <DoctorRecordCard key={id.toString()} recordId={id} />
            ))}
        </div>
    );
}

// Sub-Komponen: Kartu Status Record (Cek per ID)
function DoctorRecordCard({ recordId, showDetailed = false, patientAddress }) {
    const { address: doctorAddress } = useAccount();

    const { data, error, isPending } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getRecord',
        args: [recordId],
        account: doctorAddress,
        query: { retry: false }
    });

    if (error) {
        return (
            <div className="bg-white border-l-4 border-red-500 p-4 rounded shadow-sm">
                <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-bold text-gray-500">ID: {recordId.toString()}</span>
                     <span className="text-xs text-white bg-red-500 px-2 py-1 rounded font-bold">⛔ Akses Ditolak / Expired</span>
                </div>
                <p className="text-xs text-gray-400">Anda tidak memiliki izin aktif untuk melihat file ini.</p>
            </div>
        );
    }

    if (isPending) return <div className="bg-gray-100 p-3 rounded animate-pulse">Checking Access ID {recordId.toString()}...</div>;

    return (
        <div className={`bg-white border-l-4 border-green-500 p-4 rounded shadow-sm ${showDetailed ? 'shadow-md border border-gray-200' : ''}`}>
            <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold text-gray-500">ID RECORD: {recordId.toString()}</span>
                <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded font-bold flex items-center gap-1">
                   ✅ Akses Diberikan
                </span>
            </div>
            
            <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Diagnosa / Tipe</p>
                    <p className="text-gray-800 font-medium text-lg">{data[1]}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                     <p className="text-xs text-gray-400 uppercase font-bold mb-1">IPFS CID (File)</p>
                     <div className="flex items-center gap-2">
                        <code className="bg-white px-2 py-1 rounded border text-xs text-blue-600 font-mono break-all">{data[0]}</code>
                     </div>
                </div>

                {showDetailed && (
                    <div className="mt-4 pt-4 border-t text-xs text-gray-400 flex flex-col gap-2">
                        <div className="flex justify-between">
                            <span>Creator:</span>
                            {/* UPDATE: Full address untuk Creator */}
                            <span className="font-mono break-all text-right w-2/3">{data[2]}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span>Owner:</span>
                            {/* UPDATE: Full address untuk Owner */}
                            <span className="font-mono bg-yellow-50 px-1 rounded text-yellow-700 break-all text-right w-2/3">
                                {patientAddress ? patientAddress : 'Pasien'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


// ==========================================
// 🤒 KOMPONEN PASIEN
// ==========================================
function PatientView({ userAddress }) {
    const { writeContract } = useWriteContract();
    const [selectedRecordId, setSelectedRecordId] = useState('');
    const [doctorAddr, setDoctorAddr] = useState('');
    const [duration, setDuration] = useState(3600);

    const handleGrantAccess = async () => {
        if(!selectedRecordId || !doctorAddr) return alert("Pilih ID dan masukkan Address Dokter");
        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'grantAccess',
                args: [BigInt(selectedRecordId), doctorAddr, BigInt(duration)],
            });
            alert('Permintaan izin dikirim!');
        } catch (error) {
            console.error(error);
            alert('Gagal mengirim izin.');
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-10">
            {/* KIRI: Daftar Record Milik Saya */}
            <div className="space-y-6">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <h3 className="font-bold text-yellow-800 text-lg">📂 Rekam Medis Saya</h3>
                    <p className="text-sm text-yellow-700 mb-4">Daftar semua data yang tercatat atas nama wallet Anda.</p>
                    <MyRecordList userAddress={userAddress} onSelect={(id) => setSelectedRecordId(id.toString())} />
                </div>
            </div>

            {/* KANAN: Form Beri Izin */}
            <div className="space-y-6">
                <div className="border-b pb-4 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">🔑 Beri Izin Akses</h3>
                    <p className="text-sm text-gray-500">Bagikan data Anda ke dokter tertentu untuk durasi terbatas.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Record Terpilih</label>
                        <input type="text" value={selectedRecordId} readOnly placeholder="Pilih dari daftar di kiri..." className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 font-bold" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Dokter Tujuan</label>
                        <input type="text" placeholder="0x..." className="w-full p-3 border border-gray-300 rounded-lg text-black" onChange={(e) => setDoctorAddr(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Durasi Izin</label>
                        <select className="w-full p-3 border border-gray-300 rounded-lg text-black" onChange={(e) => setDuration(e.target.value)}>
                            <option value="3600">1 Jam</option>
                            <option value="86400">24 Jam</option>
                            <option value="604800">1 Minggu</option>
                        </select>
                    </div>
                    <button onClick={handleGrantAccess} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md">Berikan Izin Akses</button>
                </div>
            </div>
        </div>
    );
}

// Sub-Komponen: List Record Milik Pasien
function MyRecordList({ userAddress, onSelect }) {
    const { data: recordIds, isPending } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getPatientRecordIds',
        args: [userAddress],
    });

    if (isPending) return <p className="text-yellow-600 animate-pulse">Sedang memuat data...</p>;
    if (!recordIds || recordIds.length === 0) return <p className="text-gray-500 italic">Anda belum memiliki rekam medis.</p>;

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {recordIds.map((id) => (
                <MyRecordItem key={id.toString()} recordId={id} onSelect={onSelect} />
            ))}
        </div>
    );
}

// Sub-Komponen: Item Record Pasien
function MyRecordItem({ recordId, onSelect }) {
    const { address } = useAccount();
    const { data } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getRecord',
        args: [recordId],
        account: address
    });

    return (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-yellow-100 flex justify-between items-center hover:bg-yellow-50 transition">
            <div className="overflow-hidden">
                <span className="text-xs font-bold text-gray-400 block">ID: {recordId.toString()}</span>
                <span className="text-sm font-semibold text-gray-800 block truncate w-40">{data ? data[1] : 'Loading...'}</span>
            </div>
            <button onClick={() => onSelect(recordId)} className="bg-yellow-100 text-yellow-700 text-xs px-3 py-2 rounded-full font-bold hover:bg-yellow-200">Pilih</button>
        </div>
    )
}