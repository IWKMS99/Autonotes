import React from 'react';
import { Link } from 'react-router-dom';
import { STATUS_TEXTS } from 'shared';

export const NotesDashboardView = ({ notes, filteredNotes, searchQuery, setSearchQuery, sortBy, setSortBy, sortOrder, setSortOrder, getTimeAgo }) => (
  <div className="slide-up">
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-6)' }}>
      <h1>Мои конспекты</h1>
      <Link to="/upload" className="btn btn-primary">Новый конспект</Link>
    </div>

    {notes.length > 0 && (
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="form-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск" />
        <select className="form-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">По дате</option>
          <option value="title">По названию</option>
          <option value="status">По статусу</option>
        </select>
        <button className="btn btn-ghost" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>{sortOrder === 'asc' ? '↑' : '↓'}</button>
      </div>
    )}

    {filteredNotes.length === 0 ? <div className="card">Нет конспектов</div> : (
      <div style={{ display: 'grid', gap: 12 }}>
        {filteredNotes.map((note) => (
          <Link key={note.id} to={`/notes/${note.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>{note.title}</h3>
            <p>{STATUS_TEXTS[note.status] || note.status}</p>
            <p>{getTimeAgo(note.createdAt)}</p>
          </Link>
        ))}
      </div>
    )}
  </div>
);
