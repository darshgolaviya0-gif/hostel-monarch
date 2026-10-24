import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, BedDouble, Search, ArrowRightLeft, UserMinus, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { SearchInput, Select } from '../../components/ui/Misc';
import { groupIntoBuildings } from '../../utils/rooms';
import { formatINR } from '../../utils/format';
import type { Bed, Room } from '../../types';

export default function RoomsBoard({ variant }: { variant: 'admin' | 'warden' }) {
  const { user } = useAuth();
  const { rooms, students, allocateBed, vacateBed } = useAppData();
  const buildings = groupIntoBuildings(rooms);
  const [activeBuilding, setActiveBuilding] = useState(buildings[0]?.name);
  const [search, setSearch] = useState('');
  const [bedModal, setBedModal] = useState<{ room: Room; bed: Bed } | null>(null);
  const [selectedStudent, setSelectedStudent] = useState('');

  const building = buildings.find((b) => b.name === activeBuilding) ?? buildings[0];
  const allBeds = rooms.flatMap((r) => r.beds);
  const stats = {
    total: allBeds.length,
    occupied: allBeds.filter((b) => b.status === 'Occupied').length,
    available: allBeds.filter((b) => b.status === 'Available').length,
    maintenance: allBeds.filter((b) => b.status === 'Maintenance').length,
  };

  const allRoomsFlat = building?.floors.flatMap((f) => f.rooms.map((r) => ({ ...r, floorName: f.name }))) ?? [];
  const filteredRooms = allRoomsFlat.filter((r) => r.roomNo.toLowerCase().includes(search.toLowerCase()));

  const doAllocate = () => {
    if (!bedModal || !selectedStudent) return;
    const student = students.find((s) => s.id === selectedStudent);
    if (!student) return;
    allocateBed(bedModal.room.id, bedModal.bed.id, selectedStudent, user!.name);
    toast.success(`${student.name} allocated to ${bedModal.room.roomNo} / ${bedModal.bed.label}.`);
    setBedModal(null);
    setSelectedStudent('');
  };

  const doVacate = () => {
    if (!bedModal) return;
    vacateBed(bedModal.room.id, bedModal.bed.id, user!.name);
    toast.success(`Bed ${bedModal.bed.label} in ${bedModal.room.roomNo} has been vacated.`);
    setBedModal(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">Room & Bed Allocation</h2>
          <p className="text-sm text-slate-500">{variant === 'admin' ? 'Manage building, floor, room and bed allocations.' : 'View and manage room occupancy across the hostel.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-400">Total Beds</p>
          <p className="mt-1 font-display text-xl font-extrabold text-navy-950">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-400">Occupied</p>
          <p className="mt-1 font-display text-xl font-extrabold text-sky-600">{stats.occupied}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-400">Available</p>
          <p className="mt-1 font-display text-xl font-extrabold text-emerald-600">{stats.available}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-400">Maintenance</p>
          <p className="mt-1 font-display text-xl font-extrabold text-amber-600">{stats.maintenance}</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
          {buildings.map((b) => (
            <button
              key={b.name}
              onClick={() => setActiveBuilding(b.name)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${activeBuilding === b.name ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500'}`}
            >
              <Building2 className="h-4 w-4" /> {b.name}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search room number…" className="w-56" />
      </div>

      <div className="space-y-8">
        {building?.floors.map((floor) => {
          const floorRooms = filteredRooms.filter((r) => r.floorName === floor.name);
          if (floorRooms.length === 0) return null;
          return (
            <div key={floor.id}>
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">{floor.name}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {floorRooms.map((room) => {
                  const occupied = room.beds.filter((b) => b.status === 'Occupied').length;
                  const available = room.beds.filter((b) => b.status === 'Available').length;
                  return (
                    <Card key={room.id} hover>
                      <div className="flex items-center justify-between">
                        <p className="font-display text-lg font-extrabold text-navy-950">{room.roomNo}</p>
                        <Badge tone={available > 0 ? 'success' : 'neutral'} dot={false}>{available > 0 ? `${available} Available` : 'Full'}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{room.type} · {formatINR(room.monthlyRent)}/mo</p>
                      <div className="mt-3 grid grid-cols-4 gap-1.5">
                        {room.beds.map((bed) => (
                          <button
                            key={bed.id}
                            onClick={() => setBedModal({ room, bed })}
                            title={`${bed.label} — ${bed.status}${bed.studentName ? ' — ' + bed.studentName : ''}`}
                            className={`flex h-10 items-center justify-center rounded-lg text-[10px] font-bold transition hover:scale-105 ${
                              bed.status === 'Occupied' ? 'bg-navy-700 text-white' :
                              bed.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                              bed.status === 'Reserved' ? 'bg-gold-100 text-gold-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            <BedDouble className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-slate-400">{occupied}/{room.capacity} Occupied</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {bedModal && (
        <Modal open onClose={() => setBedModal(null)} title={`${bedModal.room.roomNo} — ${bedModal.bed.label}`} subtitle={bedModal.room.building}>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <p className="text-sm font-bold text-navy-950">{bedModal.bed.studentName ?? 'Vacant Bed'}</p>
              <p className="text-xs text-slate-400">{bedModal.room.type}</p>
            </div>
            <Badge status={bedModal.bed.status} />
          </div>

          {bedModal.bed.status === 'Occupied' ? (
            <div className="mt-4 space-y-3">
              <Button variant="danger" fullWidth icon={<UserMinus className="h-4 w-4" />} onClick={doVacate}>Vacate Bed</Button>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy-900">Transfer to this bed instead</label>
                <Select value={selectedStudent} onChange={setSelectedStudent} ariaLabel="Select student to transfer" className="w-full" options={[{ value: '', label: 'Select a student…' }, ...students.map((s) => ({ value: s.id, label: `${s.name} (currently ${s.allocation?.room ?? 'unallocated'})` }))]} />
                <Button variant="outline" fullWidth className="mt-2" icon={<ArrowRightLeft className="h-4 w-4" />} disabled={!selectedStudent} onClick={doAllocate}>
                  Transfer Student Here
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <label className="mb-1.5 block text-sm font-semibold text-navy-900">Allocate a student to this bed</label>
              <Select value={selectedStudent} onChange={setSelectedStudent} ariaLabel="Select student" className="w-full" options={[{ value: '', label: 'Select a student…' }, ...students.map((s) => ({ value: s.id, label: `${s.name} (${s.allocation ? 'currently ' + s.allocation.room : 'unallocated'})` }))]} />
              <Button fullWidth icon={<UserPlus className="h-4 w-4" />} disabled={!selectedStudent} onClick={doAllocate}>Allocate Student</Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
