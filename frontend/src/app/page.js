'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('doctor'); // 'doctor' | 'patient'
  const [isMounted, setIsMounted] = useState(false);

  // Mencegah error hidrasi (Next.js server vs client mismatch)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">🏥 EHR Blockchain System</h1>
        <ConnectButton />
      </div>

      {!isConnected ? (
        <div className="text-center mt-20">
          <h2 className="text-xl text-gray-600">Silakan hubungkan Wallet untuk melanjutkan</h2>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('doctor')}
              className={`px-6 py-2 rounded-full font-medium transition ${
                activeTab === 'doctor' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              👨‍⚕️ Portal Dokter
            </button>
            <button
              onClick={() => setActiveTab('patient')}
              className={`px-6 py-2 rounded-full font-medium transition ${
                activeTab === 'patient' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              🤒 Portal Pasien
            </button>
          </div>

          {/* Content */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            {activeTab === 'doctor' ? <DoctorView /> : <PatientView userAddress={address} />}
          </div>
        </div>
      )}
    </main>
  );
}

// --- KOMPONEN DOKTER ---
function DoctorView() {
  const { writeContract } = useWriteContract();
  const [patientAddr, setPatientAddr] = useState('');
  const [recordType, setRecordType] = useState('');
  const [cid, setCid] = useState('');
  const [viewId, setViewId] = useState('');
  
  // Fungsi Tambah Record
  const handleAddRecord = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'addRecord',
        args: [patientAddr, cid, recordType],
      });
      alert('Transaksi dikirim! Cek wallet Anda.');
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim transaksi');
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Input Data */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800">📝 Input Rekam Medis Baru</h3>
        <div className="grid gap-4">
          <input
            type="text"
            placeholder="Address Pasien (0x...)"
            className="p-2 border rounded w-full text-black"
            onChange={(e) => setPatientAddr(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tipe Penyakit (Misal: Flu, Rontgen)"
            className="p-2 border rounded w-full text-black"
            onChange={(e) => setRecordType(e.target.value)}
          />
          <input
            type="text"
            placeholder="IPFS CID (Dummy Hash)"
            className="p-2 border rounded w-full text-black"
            onChange={(e) => setCid(e.target.value)}
          />
          <button
            onClick={handleAddRecord}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
          >
            Submit ke Blockchain
          </button>
        </div>
      </div>

      {/* Form Lihat Data */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-gray-800">🔍 Lihat Data Pasien</h3>
        <div className="flex gap-2">
            <input
                type="number"
                placeholder="ID Record"
                className="p-2 border rounded flex-grow text-black"
                onChange={(e) => setViewId(e.target.value)}
            />
            {/* Kita kirim viewId ke komponen viewer */}
            <RecordViewer recordId={viewId} />
        </div>
      </div>
    </div>
  );
}

// Komponen Pembantu untuk Read Contract
function RecordViewer({ recordId }) {
    // FIX: Ambil address dokter yang sedang login
    const { address } = useAccount(); 

    const { data, error, isPending, refetch } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getRecord',
        args: [BigInt(recordId || 0)],
        account: address, // <--- UPDATE PENTING: Memaksa RPC menggunakan akun login sebagai msg.sender
        query: {
            enabled: false, // Jangan auto fetch, tunggu tombol diklik
            retry: false,
        }
    });

    return (
        <div className="flex-1">
             <button
                onClick={() => refetch()}
                className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-black mb-2"
            >
                Cek Akses & Data
            </button>
            
            {isPending && <p className="text-sm text-gray-500">Loading...</p>}
            
            {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded text-sm mt-2">
                    ⛔ Akses Ditolak atau Data Tidak Ada.
                    <br/><span className="text-xs text-gray-500">Log: {error.shortMessage || error.message}</span>
                </div>
            )}

            {data && (
                <div className="bg-green-50 border border-green-200 p-3 rounded mt-2 text-black">
                    <p><strong>CID File:</strong> {data[0]}</p>
                    <p><strong>Tipe:</strong> {data[1]}</p>
                    <p><strong>Dibuat Oleh:</strong> {data[2]}</p>
                </div>
            )}
        </div>
    )
}

// --- KOMPONEN PASIEN ---
function PatientView({ userAddress }) {
    const { writeContract } = useWriteContract();
    
    // State Form Grant Access
    const [recordId, setRecordId] = useState('');
    const [doctorAddr, setDoctorAddr] = useState('');
    const [duration, setDuration] = useState(3600); // Default 1 jam

    const handleGrantAccess = async () => {
        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'grantAccess',
                args: [BigInt(recordId), doctorAddr, BigInt(duration)],
            });
            alert('Permintaan izin dikirim! Silakan konfirmasi di Wallet.');
        } catch (error) {
            console.error(error);
            alert('Gagal mengirim izin.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <h3 className="font-bold text-yellow-800">👋 Halo, Pasien!</h3>
                <p className="text-sm text-yellow-700">Wallet Anda: {userAddress}</p>
            </div>

            <div>
                <h3 className="text-lg font-bold mb-4 text-gray-800">🔑 Berikan Izin Akses (Grant Access)</h3>
                <div className="grid gap-4 bg-gray-50 p-4 rounded-lg">
                    <input
                        type="number"
                        placeholder="ID Record yang ingin dibagikan"
                        className="p-2 border rounded text-black"
                        onChange={(e) => setRecordId(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Address Dokter Tujuan (0x...)"
                        className="p-2 border rounded text-black"
                        onChange={(e) => setDoctorAddr(e.target.value)}
                    />
                    <select 
                        className="p-2 border rounded text-black"
                        onChange={(e) => setDuration(e.target.value)}
                    >
                        <option value="3600">1 Jam</option>
                        <option value="86400">24 Jam</option>
                        <option value="604800">1 Minggu</option>
                    </select>
                    <button
                        onClick={handleGrantAccess}
                        className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                        Berikan Izin
                    </button>
                </div>
            </div>
        </div>
    );
}