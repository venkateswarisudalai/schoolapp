import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Send,
  Plus,
  Search,
  User,
  Check,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
  markConversationAsRead,
  getOrCreateConversation,
  getOrCreateClassGroup
} from '../../services/messageService';
import { getAllTeachers, getAllParents, type Teacher, type Parent } from '../../services/teacherService';
import { getAllChildren } from '../../services/childrenService';
import type { Message, Conversation, Child } from '../../types/index';

interface MessagesPageProps {
  onBack: () => void;
}

interface ConversationWithDetails extends Conversation {
  otherParticipantName?: string;
  otherParticipantRole?: string;
  isClassGroup?: boolean;
  className?: string;
  classId?: string;
}

const MessagesPage = ({ onBack }: MessagesPageProps) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Child[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const unsubscribe = subscribeToConversations(user.id, async (convs) => {
      const enrichedConvs = convs.map(conv => {
        const convData = conv as any;
        const lastMsg = conv.lastMessage as any;
        return {
          ...conv,
          isClassGroup: convData.isClassGroup || false,
          className: convData.className || '',
          classId: convData.classId || '',
          otherParticipantName: convData.isClassGroup
            ? `📚 ${convData.className || 'Class Group'}`
            : (lastMsg?.senderName || 'Chat'),
          otherParticipantRole: lastMsg?.senderRole || 'user'
        };
      });
      setConversations(enrichedConvs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation || !user) return;

    // Mark as read
    markConversationAsRead(selectedConversation.id, user.id);

    const unsubscribe = subscribeToMessages(selectedConversation.id, (msgs) => {
      setMessages(msgs);
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedConversation, user]);

  // Load contacts for new chat
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        if (user.role === 'parent') {
          // Parents can message teachers and admin
          const teacherList = await getAllTeachers();
          setTeachers(teacherList);
        } else if (user.role === 'teacher' || user.role === 'admin') {
          // Teachers/Admins see contacts grouped by student (messages go to parent)
          const [teacherList, parentList, studentList] = await Promise.all([
            getAllTeachers(),
            getAllParents(),
            getAllChildren()
          ]);
          setTeachers(teacherList.filter(t => t.id !== user.id));
          setParents(parentList);
          setStudents(studentList);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      await sendMessage(
        selectedConversation.id,
        user.id,
        user.name,
        user.role,
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartNewChat = async (recipientId: string, recipientName: string) => {
    if (!user) return;

    try {
      const conversationId = await getOrCreateConversation(user.id, recipientId);

      // Create a temporary conversation object to show
      const newConv: ConversationWithDetails = {
        id: conversationId,
        participants: [user.id, recipientId],
        unreadCount: 0,
        otherParticipantName: recipientName
      };

      setSelectedConversation(newConv);
      setShowNewChat(false);
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getUnreadCount = (conv: Conversation) => {
    if (!user) return 0;
    const unreadCount = (conv as any).unreadCount;
    return unreadCount?.[user.id] || 0;
  };

  // Conversation List View
  if (!selectedConversation && !showNewChat) {
    return (
      <div className="messages-page">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="page-title">Messages</h2>
          <button className="new-chat-btn" onClick={() => setShowNewChat(true)}>
            <Plus size={24} />
          </button>
        </div>

        {loading ? (
          <div className="messages-loading">
            <p>Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="empty-messages">
            <div className="empty-icon">
              <Send size={48} />
            </div>
            <h3>No messages yet</h3>
            <p>Start a conversation with a teacher or parent</p>
            <button className="btn btn-primary" onClick={() => setShowNewChat(true)}>
              Start New Chat
            </button>
          </div>
        ) : (
          <div className="conversation-list">
            {conversations.map((conv) => {
              const lastMsg = conv.lastMessage as any;
              const unread = getUnreadCount(conv);

              return (
                <div
                  className={`conversation-item ${unread > 0 ? 'unread' : ''}`}
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-avatar">
                    <User size={20} />
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-name">
                      {conv.otherParticipantName || 'Unknown'}
                    </div>
                    <div className="conversation-last-message">
                      {lastMsg?.content || 'No messages yet'}
                    </div>
                  </div>
                  <div className="conversation-meta">
                    {lastMsg?.timestamp && (
                      <div className="conversation-time">
                        {formatTime(lastMsg.timestamp)}
                      </div>
                    )}
                    {unread > 0 && (
                      <div className="conversation-unread">{unread}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // New Chat View
  if (showNewChat) {
    const query = searchQuery.toLowerCase();
    const filteredTeachers = teachers.filter(t =>
      t.name.toLowerCase().includes(query)
    );
    const filteredStudents = students.filter(s =>
      s.name.toLowerCase().includes(query) ||
      parents.find(p => p.id === s.parentIds?.[0])?.name.toLowerCase().includes(query)
    );

    const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

    return (
      <div className="messages-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => setShowNewChat(false)}>
            <ChevronLeft size={24} />
          </button>
          <h2 className="page-title">New Message</h2>
        </div>

        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="contact-list">
          {/* Class Groups - for Teachers/Admins */}
          {isTeacherOrAdmin && (
            <>
              <h3 className="contact-section-title">Class Groups</h3>
              {[
                { id: 'class-1', name: 'Sunshine Nursery', emoji: '🌱' },
                { id: 'class-2', name: 'Rainbow LKG', emoji: '📚' },
                { id: 'class-3', name: 'Star UKG', emoji: '🎓' },
              ].map(cls => (
                <div
                  className="contact-item"
                  key={cls.id}
                  onClick={async () => {
                    if (!user) return;
                    // Get all parents in this class
                    const classKids = students.filter(s => s.classId === cls.id);
                    const parentIds = classKids
                      .map(s => s.parentIds?.[0])
                      .filter(Boolean) as string[];
                    const allMembers = [...new Set([user.id, ...parentIds, ...teachers.map(t => t.id)])];

                    const convId = await getOrCreateClassGroup(cls.id, cls.name, allMembers);
                    const conv: ConversationWithDetails = {
                      id: convId,
                      participants: allMembers,
                      unreadCount: 0,
                      isClassGroup: true,
                      className: cls.name,
                      classId: cls.id,
                      otherParticipantName: `📚 ${cls.name}`,
                    };
                    setSelectedConversation(conv);
                    setShowNewChat(false);
                  }}
                >
                  <div className="contact-avatar teacher" style={{ fontSize: '20px' }}>
                    {cls.emoji}
                  </div>
                  <div className="contact-info">
                    <div className="contact-name">{cls.name}</div>
                    <div className="contact-role">Group chat with all parents & teachers</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Teachers Section - visible to everyone */}
          {filteredTeachers.length > 0 && (
            <>
              <h3 className="contact-section-title">Teachers</h3>
              {filteredTeachers.map((teacher) => (
                <div
                  className="contact-item"
                  key={teacher.id}
                  onClick={() => handleStartNewChat(teacher.id, teacher.name)}
                >
                  <div className="contact-avatar teacher">
                    <User size={20} />
                  </div>
                  <div className="contact-info">
                    <div className="contact-name">{teacher.name}</div>
                    <div className="contact-role">Teacher</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Students → Parent contacts - for Teachers/Admins */}
          {isTeacherOrAdmin && filteredStudents.length > 0 && (
            <>
              <h3 className="contact-section-title">Students (message goes to parent)</h3>
              {filteredStudents.map((student) => {
                const parentId = student.parentIds?.[0];
                const parent = parents.find(p => p.id === parentId);

                return (
                  <div
                    className="contact-item"
                    key={student.id}
                    onClick={() => {
                      if (parentId && parent) {
                        handleStartNewChat(parentId, `${parent.name} (${student.name}'s Parent)`);
                      }
                    }}
                    style={{ opacity: parentId && parent ? 1 : 0.4 }}
                  >
                    <div className="contact-avatar student">
                      <User size={20} />
                    </div>
                    <div className="contact-info">
                      <div className="contact-name">{student.name}</div>
                      <div className="contact-role">
                        {parent ? `Parent: ${parent.name}` : 'No parent linked'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {filteredTeachers.length === 0 &&
           filteredStudents.length === 0 && (
            <p className="no-contacts">No contacts found</p>
          )}
        </div>
      </div>
    );
  }

  // Chat View
  return (
    <div className="messages-page chat-view">
      <div className="chat-header">
        <button className="back-btn" onClick={() => setSelectedConversation(null)}>
          <ChevronLeft size={24} />
        </button>
        <div className="chat-header-info">
          <div className="chat-avatar">
            <User size={20} />
          </div>
          <div className="chat-name">{selectedConversation?.otherParticipantName}</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.senderId === user?.id ? 'sent' : 'received'}`}
            >
              <div className="message-bubble">
                {selectedConversation?.isClassGroup && msg.senderId !== user?.id && (
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#00897B', marginBottom: '2px' }}>
                    {msg.senderName}
                  </div>
                )}
                <div className="message-content">{msg.content}</div>
                <div className="message-meta">
                  <span className="message-time">
                    {formatTime(msg.timestamp)}
                  </span>
                  {msg.senderId === user?.id && (
                    <span className="message-status">
                      {msg.isRead ? <CheckCheck size={14} /> : <Check size={14} />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="chat-input"
        />
        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default MessagesPage;
