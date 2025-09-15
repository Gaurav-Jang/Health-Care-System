import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { adminService } from "../utils/auth";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorForm, setDoctorForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    license_number: "",
    experience_years: "",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch dashboard stats
  const fetchDashboardData = async () => {
    try {
      const result = await adminService.getDashboard();
      if (result.success) {
        setDashboardData(result.data);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Form handler for Add Doctor
  const handleFormChange = (e) => {
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
  };

  // Add new doctor
  const handleAddDoctor = async () => {
    try {
      const result = await adminService.addDoctor(doctorForm);
      if (result.success) {
        toast.success("Doctor added successfully!");
        setDoctorForm({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          phone: "",
          specialization: "",
          license_number: "",
          experience_years: "",
        });
        document.querySelector("#addDoctorModal .btn-close").click();
        fetchDashboardData();
      } else {
        toast.error(result.error || "Failed to add doctor");
      }
    } catch (err) {
      toast.error("Error while adding doctor");
    }
  };

  // Generic modal fetch for doctors or patients
  const openModal = async (type) => {
    setModalType(type);
    setSearchTerm(""); // reset search input
    try {
      let data = [];
      if (type === "doctors") {
        const result = await adminService.getDoctors();
        if (result.success) data = result.data;
        else return toast.error(result.error);
      } else if (type === "patients") {
        const result = await adminService.getPatients();
        if (result.success) data = result.data;
        else return toast.error(result.error);
      } else {
        // For appointments or predictions
        const res = await fetch(`/api/admin/${type}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const result = await res.json();
        data = result.data || [];
      }
      setModalData(data);
      new window.bootstrap.Modal(document.getElementById("dataModal")).show();
    } catch (err) {
      toast.error(`Failed to fetch ${type}`);
    }
  };

  // Delete doctors or patients
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${modalType.slice(0, -1)}?`
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/${modalType}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const result = await res.json();

      if (res.ok) {
        toast.success(`${modalType.slice(0, -1)} deleted successfully!`);
        openModal(modalType); // refresh modal
        fetchDashboardData();
      } else {
        toast.error(result.error || "Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting");
    }
  };

  // Filtered data for search
  const filteredData = modalData.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "400px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <i className="fas fa-tachometer-alt me-3"></i>
          Admin Dashboard
        </h1>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          <i className="fas fa-sync-alt me-2"></i> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        {/* Doctors */}
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card stats-card border-0 h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-uppercase text-muted mb-1">
                  Total Doctors
                </h6>
                <h3 className="mb-0">{dashboardData?.doctors?.total || 0}</h3>
                <small className="text-success">
                  <i className="fas fa-check me-1"></i>
                  {dashboardData?.doctors?.approved || 0} Approved
                </small>
              </div>
              <i className="fas fa-user-md fa-2x text-primary"></i>
            </div>
          </div>
        </div>

        {/* Patients */}
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card stats-card border-0 h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-uppercase text-muted mb-1">
                  Total Patients
                </h6>
                <h3 className="mb-0">{dashboardData?.patients?.total || 0}</h3>
                <small className="text-info">
                  <i className="fas fa-users me-1"></i> Registered
                </small>
              </div>
              <i className="fas fa-users fa-2x text-info"></i>
            </div>
          </div>
        </div>

        {/* Appointments */}
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card stats-card border-0 h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-uppercase text-muted mb-1">Appointments</h6>
                <h3 className="mb-0">
                  {dashboardData?.appointments?.total || 0}
                </h3>
                <small className="text-warning">
                  <i className="fas fa-clock me-1"></i>{" "}
                  {dashboardData?.appointments?.pending || 0} Pending
                </small>
              </div>
              <i className="fas fa-calendar fa-2x text-warning"></i>
            </div>
          </div>
        </div>

        {/* Predictions */}
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="card stats-card border-0 h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-uppercase text-muted mb-1">
                  AI Predictions
                </h6>
                <h3 className="mb-0">
                  {dashboardData?.predictions?.total_predictions || 0}
                </h3>
                <small className="text-success">
                  <i className="fas fa-brain me-1"></i> AI Powered
                </small>
              </div>
              <i className="fas fa-brain fa-2x text-success"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i> Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => openModal("doctors")}
                  >
                    <i className="fas fa-user-md d-block mb-2 fa-2x"></i> Manage
                    Doctors
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button
                    className="btn btn-outline-info w-100"
                    onClick={() => openModal("patients")}
                  >
                    <i className="fas fa-users d-block mb-2 fa-2x"></i> View
                    Patients
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button
                    className="btn btn-outline-warning w-100"
                    onClick={() => openModal("appointments")}
                  >
                    <i className="fas fa-calendar d-block mb-2 fa-2x"></i>{" "}
                    Appointments
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button
                    className="btn btn-outline-success w-100"
                    onClick={() => openModal("predictions")}
                  >
                    <i className="fas fa-brain d-block mb-2 fa-2x"></i> AI
                    Results
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button
                    className="btn btn-outline-dark w-100"
                    data-bs-toggle="modal"
                    data-bs-target="#addDoctorModal"
                  >
                    <i className="fas fa-user-plus d-block mb-2 fa-2x"></i> Add
                    Doctor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* add doctor model */}
        <div
          className="modal fade"
          id="addDoctorModal"
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">Add New Doctor</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  {Object.keys(doctorForm).map((field) => (
                    <div className="mb-3" key={field}>
                      <label className="form-label text-capitalize">
                        {field.replace("_", " ")}
                      </label>
                      <input
                        type={field === "password" ? "password" : "text"}
                        name={field}
                        value={doctorForm[field]}
                        onChange={handleFormChange}
                        className="form-control"
                        required
                      />
                    </div>
                  ))}
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleAddDoctor}
                >
                  Save Doctor
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i> System Health
              </h5>
            </div>
            <div className="card-body">
              <p>
                <strong>System Status:</strong> ✅ Online
              </p>
              <p>
                <strong>Database:</strong> ✅ Connected
              </p>
              <p>
                <strong>AI Model:</strong> ✅ Ready
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Generic Data Modal */}
      <div
        className="modal fade"
        id="dataModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div
              className="modal-header  text-white"
              style={{ backgroundColor: "#0d6efd" }}
            >
              <h5 className="modal-title text-capitalize">{modalType} Data</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-control mb-3"
                placeholder={`Search ${modalType}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {filteredData.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        {modalType === "doctors" ? (
                          <>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            {/* <th>Password</th> */}
                            <th>Phone</th>
                            <th>Specialization</th>
                            <th>License Number</th>
                            <th>Experience Years</th>
                          </>
                        ) : modalType === "patients" ? (
                          <>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Gender</th>
                            <th>Phone</th>
                            <th>Email</th>
                          </>
                        ) : null}
                        {/* <th>Actions</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          {modalType === "doctors" ? (
                            <>
                              <td>{item.first_name}</td>
                              <td>{item.last_name}</td>
                              <td>{item.email}</td>
                              {/* <td>{item.password}</td> */}
                              <td>{item.phone}</td>
                              <td>{item.specialization}</td>
                              <td>{item.license_number}</td>
                              <td>{item.experience_years}</td>
                            </>
                          ) : modalType === "patients" ? (
                            <>
                              <td>{item.first_name}</td>
                              <td>{item.last_name}</td>
                              <td>{item.gender}</td>
                              <td>{item.phone}</td>
                              <td>{item.email}</td>
                            </>
                          ) : null}
                          {/* <td className="d-flex flex-wrap gap-2"> */}
                          {/* <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(item._id)}
                            >
                              Delete
                            </button> */}
                          {/* <button
                              className="btn btn-sm btn-info"
                              onClick={() =>
                                toast.info(JSON.stringify(item, null, 2), {
                                  autoClose: 5000,
                                })
                              }
                            >
                              View
                            </button> */}
                          {/* </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
