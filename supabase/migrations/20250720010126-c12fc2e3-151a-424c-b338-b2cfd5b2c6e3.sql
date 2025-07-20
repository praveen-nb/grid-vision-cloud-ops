-- Create tables for grid connections and real-time data
CREATE TABLE public.grid_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  protocol TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  voltage DECIMAL,
  frequency DECIMAL,
  api_credentials_encrypted TEXT,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for real-time grid metrics
CREATE TABLE public.grid_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.grid_connections(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for grid alerts
CREATE TABLE public.grid_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.grid_connections(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.grid_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grid_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grid_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for grid_connections
CREATE POLICY "Users can view their own grid connections" 
ON public.grid_connections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own grid connections" 
ON public.grid_connections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grid connections" 
ON public.grid_connections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own grid connections" 
ON public.grid_connections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for grid_metrics
CREATE POLICY "Users can view metrics for their connections" 
ON public.grid_metrics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.grid_connections 
  WHERE grid_connections.id = grid_metrics.connection_id 
  AND grid_connections.user_id = auth.uid()
));

CREATE POLICY "System can insert metrics" 
ON public.grid_metrics 
FOR INSERT 
WITH CHECK (true);

-- Create policies for grid_alerts
CREATE POLICY "Users can view alerts for their connections" 
ON public.grid_alerts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.grid_connections 
  WHERE grid_connections.id = grid_alerts.connection_id 
  AND grid_connections.user_id = auth.uid()
));

CREATE POLICY "Users can update their alerts" 
ON public.grid_alerts 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.grid_connections 
  WHERE grid_connections.id = grid_alerts.connection_id 
  AND grid_connections.user_id = auth.uid()
));

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_grid_connections_updated_at
  BEFORE UPDATE ON public.grid_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_grid_connections_user_id ON public.grid_connections(user_id);
CREATE INDEX idx_grid_metrics_connection_id ON public.grid_metrics(connection_id);
CREATE INDEX idx_grid_metrics_timestamp ON public.grid_metrics(timestamp);
CREATE INDEX idx_grid_alerts_connection_id ON public.grid_alerts(connection_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);