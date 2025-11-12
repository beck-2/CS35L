import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableEvent({ event, onDelete, onEdit, onFormClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const hasForm = event.form_id !== null;
  const isApplication = event.name === 'Application';

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isApplication && hasForm) {
      onFormClick(event.form_id);
    } else if (isApplication && !hasForm) {
      onFormClick(null, event.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: isApplication ? '#007bff' : 
                           event.name === 'Acceptance' ? '#28a745' : '#6c757d',
            border: hasForm && isApplication ? '3px solid #ffc107' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px',
            textAlign: 'center',
            padding: '5px',
            cursor: isDragging ? 'grabbing' : (isApplication ? 'pointer' : 'grab'),
            boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
            position: 'relative',
          }}
          title={isApplication ? 'Click to edit form' : 'Drag to reorder'}
          onClick={isApplication ? handleClick : undefined}
          {...(isApplication ? {} : { ...attributes, ...listeners })}
        >
          {event.name}
          {isApplication && (
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                fontSize: '10px',
                color: '#007bff',
                fontWeight: 'normal',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              Click to edit
            </div>
          )}
        </div>
        {event.name !== 'Acceptance' && (
          <div style={{ marginTop: isApplication ? '25px' : '8px', fontSize: '12px', color: '#666' }}>
            {formatDate(event.event_date)}
          </div>
        )}
        {!event.is_system && (
          <div 
            style={{ marginTop: '5px', display: 'flex', gap: '5px' }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(event);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                border: '1px solid #ccc',
                borderRadius: '3px',
                cursor: 'pointer',
                backgroundColor: 'white',
                pointerEvents: 'auto',
              }}
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(event.id, event.name);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                border: '1px solid #ccc',
                borderRadius: '3px',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: 'red',
                pointerEvents: 'auto',
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Timeline() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const handleDragEnd = async (dragEvent) => {
    const { active, over } = dragEvent;

    if (!over || active.id === over.id) return;

    const acceptanceEvent = events.find(e => e.name === 'Acceptance');
    const nonAcceptanceEvents = events.filter(e => e.name !== 'Acceptance');
    const sortedEvents = [...nonAcceptanceEvents, acceptanceEvent].filter(Boolean);

    const oldIndex = sortedEvents.findIndex(e => e.id === active.id);
    const newIndex = sortedEvents.findIndex(e => e.id === over.id);

    const movedEvent = sortedEvents[oldIndex];

    if (movedEvent.name === 'Acceptance') {
      alert('Acceptance event cannot be moved');
      return;
    }

    const targetEvent = sortedEvents[newIndex];
    if (targetEvent.name === 'Acceptance') {
      alert('Events cannot be placed after Acceptance');
      return;
    }

    const newNonAcceptance = arrayMove(nonAcceptanceEvents, oldIndex, newIndex);
    const finalEvents = [...newNonAcceptance, acceptanceEvent].filter(Boolean);
    setEvents(finalEvents);

    const reorderedEvents = finalEvents.map((e, index) => ({
      id: e.id,
      position: index + 1,
    }));

    try {
      await fetch('/api/events/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: reorderedEvents }),
      });
    } catch (error) {
      console.error('Error reordering events:', error);
      fetchEvents();
    }
  };

  const handleAddEvent = async () => {
    if (!newEventName || !newEventDate) {
      alert('Please fill in both name and date');
      return;
    }

    const acceptanceIndex = events.findIndex(e => e.name === 'Acceptance');
    const position = acceptanceIndex > 0 ? acceptanceIndex : events.length;

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEventName,
          event_date: newEventDate,
          position,
        }),
      });

      if (!response.ok) throw new Error('Failed to create event');

      setShowAddModal(false);
      setNewEventName('');
      setNewEventDate('');
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Error adding event');
    }
  };

  const handleEditEvent = async () => {
    if (!editingEvent || !newEventName || !newEventDate) return;

    try {
      const response = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEventName,
          event_date: newEventDate,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update event';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
        }
        throw new Error(errorMessage);
      }

      await response.json();
      setShowAddModal(false);
      setEditingEvent(null);
      setNewEventName('');
      setNewEventDate('');
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        alert('Error updating event: Cannot connect to server. Make sure the backend is running.');
      } else {
        alert(`Error updating event: ${error.message}`);
      }
    }
  };

  const handleDeleteEvent = async (eventId, eventName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${eventName}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete event';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
        }
        throw new Error(errorMessage);
      }

      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        alert('Error deleting event: Cannot connect to server. Make sure the backend is running.');
      } else {
        alert(`Error deleting event: ${error.message}`);
      }
    }
  };

  const handleFormClick = async (formId, eventId) => {
    if (formId) {
      navigate(`/admin/forms/${formId}/edit`);
    } else {
      try {
        const response = await fetch(`/api/events/${eventId}/form`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Application Form',
            definition: { fields: [] },
          }),
        });

        if (!response.ok) throw new Error('Failed to create form');

        const form = await response.json();
        navigate(`/admin/forms/${form.id}/edit`);
      } catch (error) {
        console.error('Error creating form:', error);
        alert('Error creating form');
      }
    }
  };

  if (loading) return <div>Loading timeline...</div>;

  const acceptanceEvent = events.find(e => e.name === 'Acceptance');
  const nonAcceptanceEvents = events.filter(e => e.name !== 'Acceptance');
  const sortedEvents = [...nonAcceptanceEvents, acceptanceEvent].filter(Boolean);

  return (
    <div style={{ padding: '40px 20px' }}>
      <h1>Event Timeline</h1>
      
      <button
        onClick={() => {
          setShowAddModal(true);
          setEditingEvent(null);
          setNewEventName('');
          setNewEventDate('');
        }}
        style={{
          marginBottom: '30px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Add Event
      </button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedEvents.map(e => e.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
              padding: '40px 20px',
              overflowX: 'auto',
              minHeight: '200px',
            }}
          >
            {sortedEvents.map((event, index) => (
              <div key={event.id} style={{ display: 'flex', alignItems: 'center' }}>
                <SortableEvent
                  event={event}
                  onDelete={handleDeleteEvent}
                  onEdit={(e) => {
                    setEditingEvent(e);
                    setNewEventName(e.name);
                    const dateStr = e.event_date ? new Date(e.event_date).toISOString().split('T')[0] : '';
                    setNewEventDate(dateStr);
                    setShowAddModal(true);
                  }}
                  onFormClick={handleFormClick}
                />
                {index < sortedEvents.length - 1 && (
                  <div
                    style={{
                      width: '60px',
                      height: '2px',
                      backgroundColor: '#ccc',
                      marginLeft: '20px',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {(showAddModal || editingEvent) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            setShowAddModal(false);
            setEditingEvent(null);
            setNewEventName('');
            setNewEventDate('');
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              minWidth: '300px',
            }}
          >
            <h2>{editingEvent ? 'Edit Event' : 'Add Event'}</h2>
            <div style={{ marginBottom: '15px' }}>
              <label>
                Event Name:
                <input
                  type="text"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  placeholder="e.g., Interview"
                />
              </label>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>
                Event Date:
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  required
                />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEvent(null);
                  setNewEventName('');
                  setNewEventDate('');
                }}
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button
                onClick={editingEvent ? handleEditEvent : handleAddEvent}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                {editingEvent ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timeline;

