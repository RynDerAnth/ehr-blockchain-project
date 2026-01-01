const hre = require("hardhat");

async function main() {
  console.log("=== MEMULAI SIMULASI EHR BLOCKCHAIN (ESM Mode) ===");

  // SETUP AKUN PALSU (WALLET)
  const [deployer, doctorA, doctorB, patient1, patient2, patient3] = await hre.ethers.getSigners();

  console.log(`\nDeploying contract with account: ${deployer.address}`);

  // DEPLOY CONTRACT
  const MedicalAccess = await hre.ethers.getContractFactory("MedicalAccess");
  const contract = await MedicalAccess.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(`Contract Deployed at: ${contractAddress}`);
  console.log("---------------------------------------------------");

  // DATASET DUMMY
  const dummyRecords = [
    {
      patientName: "Budi Santoso",
      patientWallet: patient1,
      doctorWallet: doctorA,
      cid: "QmXqy8...HashBudi1",
      type: "Radiologi: Rontgen Thorax"
    },
    {
      patientName: "Budi Santoso",
      patientWallet: patient1,
      doctorWallet: doctorA,
      cid: "QmXqy8...HashBudi2",
      type: "Lab: Cek Darah Lengkap"
    },
    {
      patientName: "Siti Aminah",
      patientWallet: patient2,
      doctorWallet: doctorB,
      cid: "QmAbC9...HashSiti1",
      type: "Diagnosis: Diabetes Tipe 2"
    },
    {
      patientName: "Rangga Eka",
      patientWallet: patient3,
      doctorWallet: doctorA,
      cid: "QmZrT5...HashRangga1",
      type: "Vaksinasi: COVID-19 Booster"
    }
  ];

  console.log("\n--- TAHAP 1: INPUT DATA MEDIS (Seeding) ---");

  for (const record of dummyRecords) {
    const tx = await contract.connect(record.doctorWallet).addRecord(
      record.patientWallet.address,
      record.cid,
      record.type
    );
    await tx.wait();
    console.log(`[SUKSES] Dr. ${record.doctorWallet.address.slice(0,6)} input data untuk Pasien ${record.patientName} (${record.type})`);
  }

  console.log("\n--- TAHAP 2: SIMULASI HAK AKSES ---");

  console.log("Skenario: Pasien Budi memberikan izin ke Dokter B selama 1 jam...");
  const recordIdToShare = 1;
  const oneHour = 3600; 

  const grantTx = await contract.connect(patient1).grantAccess(
    recordIdToShare, 
    doctorB.address, 
    oneHour
  );
  await grantTx.wait();
  console.log(`[IZIN DIBERIKAN] Record ID ${recordIdToShare} sekarang bisa dibuka oleh Dokter B.`);

  console.log("\n--- TAHAP 3: VERIFIKASI KEAMANAN ---");

  try {
    const data = await contract.connect(doctorB).getRecord(recordIdToShare);
    console.log(`[TEST 1 - VALID] Dokter B mencoba akses Record ${recordIdToShare}... BERHASIL!`);
    console.log(`   > Data Terbuka: CID=${data[0]}, Tipe=${data[1]}`);
  } catch (error) {
    console.log(`[TEST 1 - GAGAL] Error: ${error.message}`);
  }

  console.log("Skenario: Dokter B mencoba mengintip data lain (Record 2) tanpa izin...");
  try {
    await contract.connect(doctorB).getRecord(2);
    console.log("[TEST 2] BAHAYA! Dokter B bisa akses data tanpa izin!");
  } catch (error) {
    console.log(`[TEST 2 - AMAN] Akses Ditolak oleh Blockchain.`);
  }

  console.log("\n=== SIMULASI SELESAI ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
