import { Link } from 'react-router-dom';
import {
  Database,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle,
  Github,
  Twitter
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useAuth } from '../../context/ContextHooks';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'In-memory storage with C++ performance optimization for millisecond response times.'
  },
  {
    icon: Shield,
    title: 'Thread-Safe',
    description: 'Built with modern C++ concurrency patterns ensuring data integrity across all operations.'
  },
  {
    icon: Globe,
    title: 'Cloud Native',
    description: 'Fully managed service with automatic scaling, backups, and global distribution.'
  },
  {
    icon: Database,
    title: 'Simple API',
    description: 'RESTful API design makes integration effortless with any programming language.'
  }
];

const stats = [
  { label: 'Uptime', value: '99.99%' },
  { label: 'Response Time', value: '<1ms' },
  { label: 'Operations/sec', value: '1M+' },
  { label: 'Global Regions', value: '12' }
];

export function LandingPage() {
  const { user, login } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {/* Navigation */}
        <nav className="relative z-10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center animate-glow">
                <Database className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">KVS++</h1>
                <p className="text-sm text-primary">Cloud</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button>
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Button onClick={login} className="group">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              <span className="text-glow">
                Lightning Fast
              </span>
              <br />
              Key-Value Storage
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up">
              Experience the power of C++ performance in the cloud. KVS++ delivers
              enterprise-grade, thread-safe, in-memory key-value storage as a service.
            </p>
            <div className="flex items-center justify-center space-x-4 animate-slide-up">
              {!user && (
                <Button size="lg" onClick={login} className="group">
                  Start Building Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
              <Button variant="outline" size="lg">
                View Documentation
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center animate-fade-in">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Why Choose KVS++ Cloud?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built from the ground up with performance, reliability, and developer
              experience in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="glass-effect border-border/50 hover:border-primary/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-24 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Enterprise-Grade Performance
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                KVS++ leverages modern C++ optimization techniques and in-memory
                architecture to deliver unmatched performance for your applications.
              </p>
              <ul className="space-y-4">
                {[
                  'Sub-millisecond response times',
                  'Thread-safe concurrent operations',
                  'Automatic horizontal scaling',
                  'Built-in data persistence',
                  '99.99% uptime SLA'
                ].map((item) => (
                  <li key={item} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:pl-8">
              <Card className="glass-effect">
                <CardContent className="p-6">
                  <pre className="text-sm text-muted-foreground overflow-x-auto">
                    {`// Simple API integration
const store = new KVSClient({
  token: 'your-store-token'
});

// Set a value
await store.set('user:123', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Get a value
const user = await store.get('user:123');

// Lightning fast operations
console.log(user); // <1ms response`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers building with KVS++ Cloud
          </p>
          {!user && (
            <Button size="lg" onClick={login} className="group">
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">KVS++ Cloud</h1>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                High-performance, thread-safe, in-memory key-value storage service
                built with modern C++ and designed for the cloud.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm">
                  <Github className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Twitter className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Status</a></li>
                <li><a href="#" className="hover:text-foreground">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground text-sm">
            <p>&copy; 2025 KVS++ Cloud. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}