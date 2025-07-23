import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Wifi,
  WifiOff 
} from 'lucide-react';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { useToast } from '@/hooks/use-toast';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isAudio?: boolean;
}

interface GISCopilotProps {
  className?: string;
  connectionId?: string; // Keep for backward compatibility
}

export function GISCopilot({ className, connectionId }: GISCopilotProps) {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMessage = (event: any) => {
    console.log('Received message:', event);
    
    switch (event.type) {
      case 'response.audio.delta':
        setIsSpeaking(true);
        break;
        
      case 'response.audio.done':
        setIsSpeaking(false);
        break;
        
      case 'response.audio_transcript.delta':
        // Update the current assistant message with transcript
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.type === 'assistant') {
            return prev.map((msg, index) => 
              index === prev.length - 1 
                ? { ...msg, content: msg.content + event.delta }
                : msg
            );
          } else {
            return [...prev, {
              id: `msg-${Date.now()}`,
              type: 'assistant',
              content: event.delta,
              timestamp: new Date(),
              isAudio: true
            }];
          }
        });
        break;
        
      case 'response.created':
        setIsLoading(false);
        break;
        
      case 'response.done':
        setIsSpeaking(false);
        setIsLoading(false);
        break;
        
      case 'error':
        toast({
          title: "Connection Error",
          description: event.message || "Failed to connect to AI service",
          variant: "destructive"
        });
        setIsLoading(false);
        break;
    }
  };

  const startConversation = async () => {
    try {
      setIsLoading(true);
      
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      
      setIsConnected(true);
      setIsRecording(true);
      
      // Add welcome message
      setMessages([{
        id: 'welcome',
        type: 'assistant',
        content: 'Hello! I\'m your Grid Operations AI Assistant. I can help you monitor your electrical grid, analyze metrics, check alerts, and provide operational guidance. How can I assist you today?',
        timestamp: new Date()
      }]);
      
      toast({
        title: "AI Copilot Connected",
        description: "Voice interface is ready. You can speak or type your questions.",
      });
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to start AI copilot',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);
    setIsLoading(false);
    
    toast({
      title: "AI Copilot Disconnected",
      description: "Voice interface has been stopped."
    });
  };

  const sendTextMessage = () => {
    if (!textInput.trim() || !isConnected || !chatRef.current) return;

    // Add user message to chat
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: textInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      chatRef.current.sendTextMessage(textInput);
      setTextInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message to AI copilot",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Grid Operations AI Copilot
              </CardTitle>
              <CardDescription>
                Your intelligent assistant for grid monitoring and operations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="default" className="gap-1">
                  <Wifi className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <WifiOff className="h-3 w-3" />
                  Disconnected
                </Badge>
              )}
              {isSpeaking && (
                <Badge variant="outline" className="gap-1 animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Speaking
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0">
          {!isConnected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Bot className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">Start AI Copilot</h3>
                  <p className="text-muted-foreground">
                    Connect to begin voice and text conversations with your AI assistant
                  </p>
                </div>
                <Button 
                  onClick={startConversation}
                  disabled={isLoading}
                  size="lg"
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                  {isLoading ? 'Connecting...' : 'Start Conversation'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4 p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`flex gap-3 max-w-[70%] ${
                          message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {message.type === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                            {message.isAudio && ' • Voice'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex gap-3 max-w-[70%]">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-lg p-3 bg-muted">
                          <LoadingSkeleton />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="flex-shrink-0 space-y-3">
                <Alert>
                  <Mic className="h-4 w-4" />
                  <AlertDescription>
                    {isRecording 
                      ? "Voice recording is active. You can speak directly or type below."
                      : "Voice recording is paused. Use text input or restart conversation."
                    }
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message or use voice..."
                    disabled={!isConnected}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendTextMessage}
                    disabled={!isConnected || !textInput.trim() || isLoading}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={endConversation}
                    variant="outline"
                    size="sm"
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}