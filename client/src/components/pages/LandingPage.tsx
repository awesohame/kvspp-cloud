import React from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle,
  Github,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useAuth } from '../../context/ContextHooks';
import { CodeBlock, dracula } from 'react-code-blocks';

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
    description: 'Fully managed service with automatic scaling, backups, and distribution.'
  },
  {
    icon: Database,
    title: 'Simple API',
    description: 'TCP and CLI architectural designs makes integration effortless with any programming language.'
  }
];

const stats = [
  { label: 'Uptime', value: '99.99%' },
  { label: 'Response Time', value: '<1ms' },
  { label: 'Docker Downloads', value: '50+' },
  { label: 'Open Source', value: 'MIT License' },
];

export const LandingPage = () => {

  const { user, login } = useAuth();
  const [dockerCopied, setDockerCopied] = React.useState(false);

  return (
    <>
      {/* Background Gradient */}
      <div className="fixed left-0 top-0 -z-10 h-full w-full">
        {/* bottom */}
        {/* <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_145%_at_50%_5%,#020818_40%,#0E0040_100%)]"></div> */}
        {/* center */}
        <div className="relative h-full w-full bg-background"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#0E0040,transparent)]"></div></div>
        {/* study light */}
        {/* <div className="absolute top-0 z-[-2] h-screen w-screen bg-background bg-[radial-gradient(100%_50%_at_50%_0%,#0E0040_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]"></div> */}
      </div>
      <div className="min-h-screen">
        <div className="relative">
          {/* Navigation */}
          <nav className="relative z-10 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center animate-glow overflow-hidden">
                  <img src="/kvspp.png" alt="KVS++ Logo" className="w-12 h-12 object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-foreground leading-tight">KVS++</h1>
                  <p className="text-md text-primary font-semibold">Cloud</p>
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
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up z-10">
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

        {/* Docker Self-Host Section */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h4 className="text-2xl font-bold mb-2">Self-Host Instantly with&nbsp;
              <a
                href="https://hub.docker.com/r/awesohame/kvspp-tcp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline inline-flex items-center justify-center gap-1"
              >
                Docker Image
                <ExternalLink className="w-6 h-6 inline-block" />
              </a>
            </h4>
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="w-full max-w-md bg-muted rounded-lg p-3 flex items-center justify-between text-left">
                <code className="text-sm select-all px-4">docker pull awesohame/kvspp-tcp:latest</code>
                <Button
                  size="sm"
                  variant={dockerCopied ? "ghost" : "outline"}
                  className="ml-2"
                  aria-label={dockerCopied ? 'Copied!' : 'Copy docker pull command'}
                  onClick={async () => {
                    await navigator.clipboard.writeText('docker pull awesohame/kvspp-tcp:latest');
                    setDockerCopied(true);
                    setTimeout(() => setDockerCopied(false), 1200);
                  }}
                >
                  {dockerCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Perfect for local development, testing, or private deployments.</p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold mb-4">Why Choose KVS++?</h3>
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
        <section className="py-24 px-6 bg-card/30 bg-transparent">
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
                  <CardContent className="p-0">
                    <CodeBlock
                      text={`# Select your store
  SELECT your-store-token

  # Basic operations
  SET foo bar
  GET foo               # Returns bar

  # Advanced operations
  KEYS                    # List all keys
  DELETE foo         # Delete a key
  JSON                    # Export entire store

  # Persistence
  AUTOSAVE ON            # Enable auto-save
  SAVE backup         # Manual save
  LOAD backup         # Load from file

  QUIT                   # Close connection`}
                      language="shell"
                      showLineNumbers={false}
                      theme={dracula}
                      customStyle={{
                        fontSize: '12px',
                        borderRadius: '8px',
                        background: 'rgba(0, 0, 0, 0.2)',
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="py-24 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-4xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of developers building with KVS++ Cloud
              </p>
              <Button size="lg" onClick={login} className="group">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="py-4 px-6">
          <div className="border-t border-border pt-8 max-w-6xl mx-auto">
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
                  <a
                    href="https://github.com/awesohame/kvspp-cloud"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      <Github className="w-4 h-4" />
                    </Button>
                  </a>
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
              <p>&copy; {new Date().getFullYear()} KVS++ All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};