pragma solidity ^0.8.19;

/**
 * @title MedicalAccess
 * @dev Kontrak untuk manajemen hak akses rekam medis.
 */
contract MedicalAccess {
    struct Record {
        uint256 id;
        string ipfsCid;      
        address patient;     
        address createdBy;   
        string recordType;   
        uint256 timestamp;
        bool exists;
    }

    uint256 private _recordIds;
    mapping(uint256 => Record) public records;

    mapping(uint256 => mapping(address => uint256)) public accessRegistry;
    mapping(address => uint256[]) private patientRecords;

    event RecordAdded(uint256 indexed recordId, address indexed patient, string recordType);
    event AccessGranted(uint256 indexed recordId, address indexed patient, address indexed doctor);
    event AccessRevoked(uint256 indexed recordId, address indexed patient, address indexed doctor);

    modifier onlyPatient(uint256 _recordId) {
        require(records[_recordId].exists, "Record tidak ditemukan");
        require(msg.sender == records[_recordId].patient, "Hanya pasien pemilik data yang boleh akses");
        _;
    }

    function addRecord(address _patientAddress, string calldata _ipfsCid, string calldata _recordType) external returns (uint256) {
        _recordIds++;
        uint256 newId = _recordIds;

        records[newId] = Record({
            id: newId,
            ipfsCid: _ipfsCid,
            patient: _patientAddress,
            createdBy: msg.sender,
            recordType: _recordType,
            timestamp: block.timestamp,
            exists: true
        });

        patientRecords[_patientAddress].push(newId);
        emit RecordAdded(newId, _patientAddress, _recordType);
        return newId;
    }

    function grantAccess(uint256 _recordId, address _doctor, uint256 _durationInSeconds) external onlyPatient(_recordId) {
        accessRegistry[_recordId][_doctor] = block.timestamp + _durationInSeconds;
        emit AccessGranted(_recordId, msg.sender, _doctor);
    }

    function revokeAccess(uint256 _recordId, address _doctor) external onlyPatient(_recordId) {
        accessRegistry[_recordId][_doctor] = 0;
        emit AccessRevoked(_recordId, msg.sender, _doctor);
    }

    function getRecord(uint256 _recordId) external view returns (string memory, string memory, address) {
        require(records[_recordId].exists, "Record tidak ditemukan");

        bool isPatient = msg.sender == records[_recordId].patient;
        bool hasActivePermission = accessRegistry[_recordId][msg.sender] > block.timestamp;

        require(isPatient || hasActivePermission, "AKSES DITOLAK: Anda tidak memiliki izin.");

        Record memory r = records[_recordId];
        return (r.ipfsCid, r.recordType, r.createdBy);
    }

    function getPatientRecordIds(address _patient) external view returns (uint256[] memory) {
        return patientRecords[_patient];
    }
}