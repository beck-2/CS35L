import { useState, useEffect, useRef } from 'react';
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
import { FileText, Search, Phone, Users, CheckCircle, Briefcase, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

// Color styles matching Figma design
const colorStyles = {
  light: {
    bg: '#9DC3C2',
    shadow: 'rgba(157,195,194,0.2)',
    glow: 'rgba(157,195,194,0.4)',
  },
  medium: {
    bg: '#77A6B6',
    shadow: 'rgba(119,166,182,0.2)',
    glow: 'rgba(119,166,182,0.4)',
  },
  dark: {
    bg: '#4D7298',
    shadow: 'rgba(77,114,152,0.2)',
    glow: 'rgba(77,114,152,0.4)',
  },
  accent: {
    bg: '#84BF5F',
    shadow: 'rgba(132,191,95,0.2)',
    glow: 'rgba(132,191,95,0.4)',
  },
};

function SortableEvent({ event, onDelete, onEdit, onFormClick, index, total, onEventClick, selectedEventId, onEventSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedEventId === event.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const hasForm = event.form_id !== null;
  const isApplication = event.name === 'Application';

  const handleCardClick = (e) => {
    if (isApplication) {
      // Application events still navigate to form
      handleClick(e);
    } else {
      // Other events toggle expansion and select this event
      setIsExpanded(!isExpanded);
      if (onEventSelect) {
        // If clicking the same event, deselect; otherwise select the new one
        onEventSelect(isSelected ? null : event.id);
      }
      if (onEventClick) {
        onEventClick(event);
      }
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isApplication && hasForm) {
      onFormClick(event.form_id);
    } else if (isApplication && !hasForm) {
      onFormClick(null, event.id);
    }
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Get icon and color based on event
  const getIconAndColor = () => {
    if (isApplication) {
      return { Icon: FileText, color: 'light' };
    }
    if (event.name === 'Acceptance') {
      return { Icon: CheckCircle, color: 'accent' };
    }
    const nameLower = event.name.toLowerCase();
    if (nameLower.includes('interview') || nameLower.includes('phone')) {
      return { Icon: Phone, color: 'dark' };
    }
    if (nameLower.includes('screening') || nameLower.includes('review')) {
      return { Icon: Search, color: 'medium' };
    }
    if (nameLower.includes('team') || nameLower.includes('group')) {
      return { Icon: Users, color: 'medium' };
    }
    if (nameLower.includes('final') || nameLower.includes('executive')) {
      return { Icon: Briefcase, color: 'dark' };
    }
    return { Icon: FileText, color: 'medium' };
  };

  const { Icon, color } = getIconAndColor();
  const colors = colorStyles[color] || colorStyles.medium;
  
  // Alternate top/bottom positions
  const isTop = index % 2 === 0;
  const stageNumber = index + 1;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'relative',
        flexShrink: 0,
        width: '150px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          ...(isTop ? { bottom: '50%', marginBottom: '48px' } : { top: '50%', marginTop: '48px' }),
        }}
      >
        {/* Connecting line to center */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '1px',
            height: '48px',
            backgroundColor: '#e5e5e5',
            ...(isTop ? { top: '100%' } : { bottom: '100%' }),
          }}
        />

        {/* Event Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '150px',
            boxShadow: isDragging 
              ? `0 8px 30px ${colors.shadow}` 
              : '0 2px 20px rgba(0,0,0,0.06)',
            border: '1px solid #f5f5f4',
            cursor: isDragging ? 'grabbing' : 'pointer',
            transition: 'all 0.3s ease',
            transform: isDragging ? 'none' : 'translateY(0)',
            position: 'relative',
            ...(isApplication ? {} : { ...attributes, ...listeners }),
          }}
          title={isApplication ? 'Click to edit form' : 'Click to view details'}
          onClick={handleCardClick}
          onMouseEnter={(e) => {
            if (!isDragging) {
              e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {/* Members only lock icon */}
          {event.members_only && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                zIndex: 2,
              }}
            >
              <Lock size={14} color="#9ca3af" strokeWidth={2} />
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '16px',
            }}
          >
            {/* Icon */}
            <div
              style={{
                backgroundColor: colors.bg,
                borderRadius: '50%',
                padding: '14px',
                boxShadow: `0 8px 30px ${colors.shadow}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isDragging) {
                  e.currentTarget.style.transform = 'scale(1.08)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Icon size={20} color="white" strokeWidth={1.5} />
            </div>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              <div
                style={{
                  color: '#a3a3a3',
                  fontSize: '13px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  fontWeight: '500',
                }}
              >
                STAGE {stageNumber}
              </div>
              <div
                style={{
                  color: '#0a0a0a',
                  fontSize: '16px',
                  fontWeight: '600',
                  letterSpacing: '-0.01em',
                }}
              >
                {event.name}
              </div>
              {event.name !== 'Acceptance' && event.event_date && (
                <div
                  style={{
                    color: '#737373',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span>{formatDate(event.event_date)}</span>
                  {event.location && (
                    <span style={{ fontSize: '13px' }}>{event.location}</span>
                  )}
                </div>
              )}
              {event.notes && (
                <div
                  style={{
                    marginTop: '8px',
                    color: '#737373',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    maxHeight: isExpanded ? 'none' : '40px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  title={event.notes}
                >
                  {isExpanded ? event.notes : truncateText(event.notes)}
                </div>
              )}
              {isApplication && hasForm && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#4D7298',
                    fontWeight: '500',
                    marginTop: '4px',
                  }}
                >
                  Click to view form
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit/Delete buttons - only show when selected, positioned below card */}
        {!event.is_system && isSelected && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: '100%',
              marginTop: '6px',
              display: 'flex',
              gap: '6px',
            }}
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
                fontSize: '11px',
                padding: '6px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: '#666',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
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
                fontSize: '11px',
                padding: '6px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: '#dc3545',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fee';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Center dot on timeline */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: colors.bg,
            boxShadow: `0 0 20px ${colors.glow}`,
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
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
  const [newEventNotes, setNewEventNotes] = useState('');
  const [newEventMembersOnly, setNewEventMembersOnly] = useState(false);
  const [newEventLocation, setNewEventLocation] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const scrollContainerRef = useRef(null);
  
  const scrollLeft = () => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

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
          notes: newEventNotes || null,
          members_only: newEventMembersOnly,
          location: newEventLocation || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create event');

      setShowAddModal(false);
      setNewEventName('');
      setNewEventDate('');
      setNewEventNotes('');
      setNewEventMembersOnly(false);
      setNewEventLocation('');
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
          notes: newEventNotes || null,
          members_only: newEventMembersOnly,
          location: newEventLocation || null,
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
      setNewEventNotes('');
      setNewEventMembersOnly(false);
      setNewEventLocation('');
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

      setSelectedEventId(null); // Deselect after deleting
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

  if (loading) {
    return (
      <div style={{ 
        padding: '40px 20px', 
        paddingTop: '100px',
        backgroundColor: '#F5FCEE',
        minHeight: '100vh',
      }}>
        <div>Loading timeline...</div>
      </div>
    );
  }

  const acceptanceEvent = events.find(e => e.name === 'Acceptance');
  const nonAcceptanceEvents = events.filter(e => e.name !== 'Acceptance');
  const sortedEvents = [...nonAcceptanceEvents, acceptanceEvent].filter(Boolean);

  return (
    <div style={{ 
      backgroundColor: '#F5FCEE',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ 
        maxWidth: '1800px', 
        margin: '0 auto', 
        width: '100%', 
        height: '100%',
        display: 'flex', 
        flexDirection: 'column',
        padding: '90px 20px 10px 20px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}>
        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{ 
              color: '#2d3436', 
              marginBottom: '4px', 
              fontSize: '32px',
              fontWeight: '600',
              letterSpacing: '-0.02em',
            }}>
              Event timeline
            </h1>
            <p style={{ color: '#636e72', fontSize: '16px', margin: 0 }}>
              Add events and share them with your team
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddModal(true);
              setEditingEvent(null);
              setNewEventName('');
              setNewEventDate('');
              setNewEventNotes('');
              setNewEventMembersOnly(false);
              setNewEventLocation('');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4D7298',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              height: 'fit-content',
            }}
          >
            Add Event
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
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
                  position: 'relative',
                  width: '100%',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  overflow: 'hidden',
                }}
              >
              {/* Left Arrow */}
              <button
                onClick={scrollLeft}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <ChevronLeft size={20} color="#666" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={scrollRight}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <ChevronRight size={20} color="#666" />
              </button>

              <div
                ref={scrollContainerRef}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#9DC3C2 #f5f5f5',
                }}
              >
                <div
                  style={{
                    minWidth: 'max-content',
                    padding: '0 60px',
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {/* Gradient line */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'linear-gradient(to right, transparent, #9DC3C2, transparent)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />

                    {/* Events */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: '64px',
                      }}
                    >
                      {sortedEvents.map((event, index) => (
                        <SortableEvent
                          key={event.id}
                          event={event}
                          index={index}
                          total={sortedEvents.length}
                          onDelete={handleDeleteEvent}
                          onEdit={(e) => {
                            setEditingEvent(e);
                            setNewEventName(e.name);
                            const dateStr = e.event_date ? new Date(e.event_date).toISOString().split('T')[0] : '';
                            setNewEventDate(dateStr);
                            setNewEventNotes(e.notes || '');
                            setNewEventMembersOnly(e.members_only || false);
                            setNewEventLocation(e.location || '');
                            setShowAddModal(true);
                            setSelectedEventId(null); // Deselect when editing
                          }}
                          onFormClick={handleFormClick}
                          selectedEventId={selectedEventId}
                          onEventSelect={setSelectedEventId}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SortableContext>
        </DndContext>
        </div>

        {/* Add/Edit Modal */}
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
              setNewEventNotes('');
              setNewEventMembersOnly(false);
              setNewEventLocation('');
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
              <div style={{ marginBottom: '15px' }}>
                <label>
                  Location (optional):
                  <input
                    type="text"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    placeholder="e.g., Conference Room A, Zoom"
                  />
                </label>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>
                  Notes (optional):
                  <textarea
                    value={newEventNotes}
                    onChange={(e) => setNewEventNotes(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px', resize: 'vertical' }}
                    placeholder="Add any notes about this event..."
                  />
                </label>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newEventMembersOnly}
                    onChange={(e) => setNewEventMembersOnly(e.target.checked)}
                  />
                  <span>Members only (visible to members only)</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEvent(null);
                    setNewEventName('');
                    setNewEventDate('');
                    setNewEventNotes('');
                    setNewEventMembersOnly(false);
                    setNewEventLocation('');
                  }}
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={editingEvent ? handleEditEvent : handleAddEvent}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4D7298',
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
    </div>
  );
}

export default Timeline;
