"use client";
import { useState } from "react";

export default function AddStudentForm({ onAdd }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    studentId: "",
    linkedin: "",
    ticketId: "",
    attended: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/Students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    onAdd();
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      studentId: "",
      linkedin: "",
      ticketId: "",
      attended: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 bg-base-200 rounded-lg">
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="First Name"
          className="input input-bordered"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          className="input input-bordered"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Phone"
          className="input input-bordered"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Student ID"
          className="input input-bordered"
          value={formData.studentId}
          onChange={(e) =>
            setFormData({ ...formData, studentId: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="LinkedIn"
          className="input input-bordered"
          value={formData.linkedin}
          onChange={(e) =>
            setFormData({ ...formData, linkedin: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Ticket ID"
          className="input input-bordered"
          value={formData.ticketId}
          onChange={(e) =>
            setFormData({ ...formData, ticketId: e.target.value })
          }
          required
        />
        <input
          type="checkbox"
          className="checkbox"
          checked={formData.attended}
          onChange={(e) =>
            setFormData({ ...formData, attended: e.target.checked })
          }
        />
        <label className="label cursor-pointer">Attended</label>

        <button type="submit" className="btn btn-primary">
          Add Student
        </button>
      </div>
    </form>
  );
}
