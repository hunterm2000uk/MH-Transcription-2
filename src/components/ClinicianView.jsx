import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useAuth } from '../AuthContext';
    import ReactQuill from 'react-quill';
    import 'react-quill/dist/quill.snow.css';

    const initialPatients = [
      { id: 1, name: 'John Doe', dob: '01/01/1980', mrn: '12345', address: '123 Main St', referrer: 'Dr. Smith' },
      { id: 2, name: 'Jane Smith', dob: '05/10/1990', mrn: '67890', address: '456 Oak Ave', referrer: 'Dr. Jones' },
      { id: 3, name: 'Robert Brown', dob: '12/03/1975', mrn: '24680', address: '789 Pine Ln', referrer: 'Dr. Lee' },
      { id: 4, name: 'Emily White', dob: '08/15/1988', mrn: '13579', address: '101 Maple Dr', referrer: 'Dr. Green' },
      { id: 5, name: 'Michael Green', dob: '03/22/1995', mrn: '98765', address: '222 Cedar Rd', referrer: 'Dr. Brown' },
      { id: 6, name: 'Jessica Black', dob: '06/07/1982', mrn: '54321', address: '333 Birch Ct', referrer: 'Dr. White' },
      { id: 7, name: 'David Grey', dob: '11/29/1992', mrn: '10987', address: '444 Willow Way', referrer: 'Dr. Grey' },
      { id: 8, name: 'Ashley Blue', dob: '04/18/1986', mrn: '76543', address: '555 Cherry St', referrer: 'Dr. Blue' },
      { id: 9, name: 'Kevin Red', dob: '09/01/1978', mrn: '23456', address: '666 Peach Pl', referrer: 'Dr. Red' },
      { id: 10, name: 'Sarah Pink', dob: '07/14/1998', mrn: '87654', address: '777 Plum Ln', referrer: 'Dr. Pink' },
    ];

    const modules = {
      toolbar: [
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
    };

    const ClinicianView = () => {
      const [patients, setPatients] = useState(initialPatients);
      const [selectedPatient, setSelectedPatient] = useState(null);
      const [documentContent, setDocumentContent] = useState('');
      const [myDocuments, setMyDocuments] = useState([]);
      const [showMyDocuments, setShowMyDocuments] = useState(false);
      const [selectedDocument, setSelectedDocument] = useState(null);
      const [editedContent, setEditedContent] = useState('');
      const [searchTerm, setSearchTerm] = useState('');
      const navigate = useNavigate();
      const { user, logout } = useAuth();

      useEffect(() => {
        const storedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
        setMyDocuments(storedDocuments.filter(doc => doc.clinician?.role === 'clinician'));
      }, []);

      const getNextDocumentId = () => {
        const currentId = localStorage.getItem('documentIdCounter') || '0';
        const nextId = parseInt(currentId, 10) + 1;
        localStorage.setItem('documentIdCounter', nextId.toString());
        return nextId;
      };

      const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
      };

      const handleSendToSecretary = () => {
        const newDocument = {
          id: getNextDocumentId(),
          patient: selectedPatient,
          content: documentContent,
          status: 'pending_secretary',
          clinician: user,
        };
        saveDocument(newDocument);
        setSelectedPatient(null);
        setDocumentContent('');
      };

      const handleCompleteDocument = () => {
        if (selectedDocument) {
          const updatedDocuments = myDocuments.map(doc => {
            if (doc.id === selectedDocument.id) {
              return { ...doc, status: 'completed', content: editedContent };
            }
            return doc;
          });
          setMyDocuments(updatedDocuments);
          localStorage.setItem('documents', JSON.stringify(updatedDocuments));
        }
        setSelectedDocument(null);
        setEditedContent('');
        setShowMyDocuments(true);
      };

      const handleSendBackToSecretary = () => {
          if (selectedDocument) {
            const updatedDocuments = myDocuments.map(doc => {
                if (doc.id === selectedDocument.id) {
                    return { ...doc, status: 'pending_secretary', content: editedContent };
                }
                return doc;
            });
            setMyDocuments(updatedDocuments);
            localStorage.setItem('documents', JSON.stringify(updatedDocuments));
          }
          setSelectedDocument(null);
          setEditedContent('');
          setShowMyDocuments(true);
      };

      const handleEditDocument = (doc) => {
          setSelectedDocument(doc);
          setEditedContent(doc.content);
          setShowMyDocuments(false);
      };

      const saveDocument = (document) => {
        let storedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
        storedDocuments.push(document);
        localStorage.setItem('documents', JSON.stringify(storedDocuments));
        setMyDocuments(prev => [...prev, document].filter(doc => doc.clinician?.role === 'clinician'));
      };

      const handleLogout = () => {
        logout();
        navigate('/');
      };

      const handleMyDocumentsClick = () => {
        setShowMyDocuments(!showMyDocuments);
        setSelectedDocument(null);
        setEditedContent('');
      };

      const handleCancelEdit = () => {
          setSelectedDocument(null);
          setEditedContent('');
          setShowMyDocuments(true);
      };

      const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
      };

      const filteredPatients = () => {
        if (!searchTerm) {
          return patients;
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return patients.filter(patient =>
          patient.name.toLowerCase().includes(lowerSearchTerm) ||
          patient.mrn.includes(lowerSearchTerm)
        );
      };

      const getRowColor = (status) => {
        switch (status) {
          case 'completed':
            return '#ccffcc';
          case 'pending_secretary':
            return '#ffffcc';
          case 'pending_clinician':
            return '#ffcccc';
          default:
            return 'white';
        }
      };

      if (selectedDocument) {
          return (
              <div className="container">
                  <h1>Review Document</h1>
                  <p>Patient Name: {selectedDocument.patient.name}</p>
                  <p>Patient DOB: {selectedDocument.patient.dob}</p>
                  <p>Patient MRN: {selectedDocument.patient.mrn}</p>
                  <ReactQuill value={editedContent} onChange={setEditedContent} modules={modules} />
                  <button onClick={handleSendBackToSecretary}>Send to Secretary</button>
                  <button onClick={handleCompleteDocument}>Complete Document</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
              </div>
          );
      }

      if (showMyDocuments) {
        return (
          <div className="container">
            <h1>My Documents</h1>
            <table>
              <thead>
                <tr>
                  <th>Document ID</th>
                  <th>Patient Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myDocuments.map((doc) => (
                  <tr key={doc.id} style={{ backgroundColor: getRowColor(doc.status) }}>
                    <td>{doc.id}</td>
                    <td>{doc.patient.name}</td>
                    <td>{doc.status}</td>
                    <td>
                        {doc.status === 'pending_clinician' && (
                            <button onClick={() => handleEditDocument(doc)}>Review</button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleMyDocumentsClick}>Back to Patient Select</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        );
      }

      if (!selectedPatient) {
        return (
          <div className="container">
            <h1>Select a Patient</h1>
            <input
              type="text"
              placeholder="Search by name or MRN"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date of Birth</th>
                  <th>MRN</th>
                  <th>Address</th>
                  <th>Referrer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients().map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.name}</td>
                    <td>{patient.dob}</td>
                    <td>{patient.mrn}</td>
                    <td>{patient.address}</td>
                    <td>{patient.referrer}</td>
                    <td>
                      <button onClick={() => handlePatientSelect(patient)}>Select</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleMyDocumentsClick}>My Documents</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        );
      }

      return (
        <div className="container">
          <h1>Patient Details</h1>
          <p>Name: {selectedPatient.name}</p>
          <p>Date of Birth: {selectedPatient.dob}</p>
          <p>MRN: {selectedPatient.mrn}</p>

          <h2>Document Content</h2>
          <ReactQuill value={documentContent} onChange={setDocumentContent} modules={modules} />

          <button onClick={handleSendToSecretary}>Send to Secretary</button>
          <button onClick={handleCompleteDocument}>Complete Document</button>
          <button onClick={handleMyDocumentsClick}>My Documents</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      );
    };

    export default ClinicianView;
