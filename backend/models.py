from sqlalchemy import Column, String, Integer, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
import datetime

from database import Base

class Friend(Base):
    __tablename__ = "friends"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    department = Column(String)
    description = Column(Text)
    system_prompt = Column(Text)
    dataSources = Column(JSON, default=list)
    creator = Column(String, default="system")

    messages = relationship("ChatMessage", back_populates="friend")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    friend_id = Column(String, ForeignKey("friends.id"))
    role = Column(String) # "user" or "assistant"
    text = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    friend = relationship("Friend", back_populates="messages")
