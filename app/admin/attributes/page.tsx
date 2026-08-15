"use client";

import { useEffect, useState } from "react";
import { Plus, ChevronDown, ChevronUp, Trash2, Edit2, Tag } from "lucide-react";

export default function AdminAttributesPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Group form state
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: "",
    unit: "",
    isFilterable: true,
    isVariantDefining: false,
  });
  const [groupSubmitting, setGroupSubmitting] = useState(false);
  const [groupError, setGroupError] = useState("");

  // Value form state (keyed by group id)
  const [valueFormGroupId, setValueFormGroupId] = useState<string | null>(null);
  const [valueInput, setValueInput] = useState("");
  const [valueSubmitting, setValueSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/attributes");
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error("Failed to load attributes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setGroupForm({ ...groupForm, [name]: type === "checkbox" ? checked : value });
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGroupSubmitting(true);
    setGroupError("");
    try {
      const res = await fetch("/api/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groupForm),
      });
      const data = await res.json();
      if (res.ok) {
        setIsGroupFormOpen(false);
        setGroupForm({ name: "", unit: "", isFilterable: true, isVariantDefining: false });
        fetchGroups();
      } else {
        setGroupError(data.error || "Failed to create attribute group");
      }
    } catch (err) {
      setGroupError("An unexpected error occurred");
    } finally {
      setGroupSubmitting(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm("Delete this attribute group and all its values?")) return;
    const res = await fetch(`/api/attributes/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchGroups();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete");
    }
  };

  const handleAddValue = async (groupId: string) => {
    if (!valueInput.trim()) return;
    setValueSubmitting(true);
    try {
      const res = await fetch(`/api/attributes/${groupId}/values`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: valueInput.trim(), sortOrder: 0 }),
      });
      if (res.ok) {
        setValueInput("");
        setValueFormGroupId(null);
        fetchGroups();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add value");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setValueSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Attribute Groups</h2>
        <button
          onClick={() => setIsGroupFormOpen(!isGroupFormOpen)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium text-sm transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Group
        </button>
      </div>

      {isGroupFormOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">New Attribute Group</h3>
          {groupError && <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-md text-sm">{groupError}</div>}
          <form onSubmit={handleGroupSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  required
                  name="name"
                  value={groupForm.name}
                  onChange={handleGroupChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. RAM, Storage, Color"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit (optional)</label>
                <input
                  name="unit"
                  value={groupForm.unit}
                  onChange={handleGroupChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. GB, inches"
                />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFilterable"
                  checked={groupForm.isFilterable}
                  onChange={handleGroupChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                Filterable (shown in sidebar filters)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isVariantDefining"
                  checked={groupForm.isVariantDefining}
                  onChange={handleGroupChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                Variant-defining (e.g. RAM, Color)
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsGroupFormOpen(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={groupSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {groupSubmitting ? "Saving..." : "Create Group"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : groups.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg py-16 text-center text-gray-500">
          <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium">No attribute groups yet.</p>
          <p className="text-sm mt-1">Create your first group to start defining product attributes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* Group Header */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpandedId(expandedId === group.id ? null : group.id)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    {expandedId === group.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {group.name}
                      {group.unit && <span className="text-gray-400 font-normal ml-1">({group.unit})</span>}
                    </h3>
                    <div className="flex gap-2 mt-0.5">
                      {group.isFilterable && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Filterable</span>
                      )}
                      {group.isVariantDefining && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">Variant</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">{group.values?.length || 0} values</span>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Values */}
              {expandedId === group.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(group.values || []).map((val: any) => (
                      <span
                        key={val.id}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-white border border-gray-200 text-gray-700"
                      >
                        {val.value}
                      </span>
                    ))}
                    {group.values?.length === 0 && (
                      <span className="text-sm text-gray-400 italic">No values yet.</span>
                    )}
                  </div>

                  {/* Add value inline */}
                  {valueFormGroupId === group.id ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        autoFocus
                        value={valueInput}
                        onChange={(e) => setValueInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); handleAddValue(group.id); }
                          if (e.key === "Escape") { setValueFormGroupId(null); setValueInput(""); }
                        }}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={`Add value for "${group.name}"...`}
                      />
                      <button
                        onClick={() => handleAddValue(group.id)}
                        disabled={valueSubmitting}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {valueSubmitting ? "..." : "Add"}
                      </button>
                      <button
                        onClick={() => { setValueFormGroupId(null); setValueInput(""); }}
                        className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setValueFormGroupId(group.id); setValueInput(""); }}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add value
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
