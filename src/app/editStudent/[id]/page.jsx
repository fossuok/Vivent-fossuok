"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function EditStudentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: student, error } = useSWR(`/api/Students/${id}`, fetcher);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    linkedin: "",
    studentId: "",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        phone: student.phone,
        linkedin: student.linkedin,
        studentId: student.studentId,
      });
    }
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to save changes?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/Students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          linkedin: formData.linkedin,
          studentId: formData.studentId,
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  if (error) return <div>Failed to load student</div>;
  if (!student) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Student</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            className="input input-bordered w-full"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            className="input input-bordered w-full"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Phone"
            className="input input-bordered w-full"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="LinkedIn"
            className="input input-bordered w-full"
            value={formData.linkedin}
            onChange={(e) =>
              setFormData({ ...formData, linkedin: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Student ID"
            className="input input-bordered w-full"
            value={formData.studentId}
            onChange={(e) =>
              setFormData({ ...formData, studentId: e.target.value })
            }
            required
          />
        </div>
        <div className="flex gap-4">
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="btn btn-ghost"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
