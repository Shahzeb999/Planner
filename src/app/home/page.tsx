'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Calendar, 
  Target, 
  BarChart3, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Zap,
  Users,
  Trophy,
  FileText,
  Search,
  Upload,
  Brain,
  Code,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      title: "Smart Planning",
      description: "Structured 6-month preparation timeline with daily tasks, challenges, and milestones.",
      details: "Get a comprehensive study plan that adapts to your progress and ensures you cover all essential topics."
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: "Mock Interviews",
      description: "Practice system design, coding, ML, and behavioral interviews with detailed feedback tracking.",
      details: "Schedule mock interviews, track outcomes, and identify improvement areas with detailed performance analytics."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-purple-600" />,
      title: "Interactive Playbooks",
      description: "Step-by-step guides for LLM topics, system design patterns, and technical concepts.",
      details: "Access curated playbooks covering transformers, RAG systems, fine-tuning, evaluation, and more."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      title: "Progress Analytics",
      description: "Visual insights into your preparation progress, time allocation, and performance trends.",
      details: "Track your study time, problem-solving progress, and mock interview performance with detailed charts."
    },
    {
      icon: <Code className="h-8 w-8 text-red-600" />,
      title: "Problem Tracking",
      description: "Organize and track LeetCode problems, OOP exercises, and technical challenges.",
      details: "Categorized problem sets with difficulty tracking, time logging, and status management."
    },
    {
      icon: <Clock className="h-8 w-8 text-indigo-600" />,
      title: "Time Management",
      description: "Built-in session timers, Pomodoro tracking, and time allocation insights.",
      details: "Track your study sessions with integrated timers and analyze your time distribution across topics."
    }
  ];

  const stats = [
    { number: "6", label: "Month Program", icon: <Calendar className="h-5 w-5" /> },
    { number: "12", label: "Interactive Playbooks", icon: <BookOpen className="h-5 w-5" /> },
    { number: "100+", label: "Practice Problems", icon: <Code className="h-5 w-5" /> },
    { number: "Real-time", label: "Progress Tracking", icon: <BarChart3 className="h-5 w-5" /> }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16 sm:pb-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-6">
              <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LLM Prep Planner
              </h1>
            </div>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-4 sm:px-0">
              Your comprehensive preparation platform for Large Language Model and AI engineering interviews. 
              Master system design, coding challenges, and technical concepts with our structured 6-month program.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4">
              <Badge variant="outline" className="px-3 sm:px-4 py-2 text-xs sm:text-sm">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Structured Learning
              </Badge>
              <Badge variant="outline" className="px-3 sm:px-4 py-2 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Mock Interviews
              </Badge>
              <Badge variant="outline" className="px-3 sm:px-4 py-2 text-xs sm:text-sm">
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Progress Tracking
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <Link href="/today">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3">
                  View Study Plan
                  <Calendar className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white/80 backdrop-blur-sm border-y border-gray-200 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 mb-2">
                    <div className="text-blue-600">{stat.icon}</div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.number}</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              From structured study plans to real-time progress tracking, we've got every aspect of your preparation covered.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-start">
            {/* Feature List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeFeature === index 
                      ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Feature Details */}
            <div className="lg:sticky lg:top-8">
              <Card className="bg-gradient-to-br from-gray-50 to-white shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {features[activeFeature].icon}
                    <CardTitle className="text-2xl">
                      {features[activeFeature].title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    {features[activeFeature].details}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">AI-Powered</Badge>
                    <Badge variant="secondary">Real-time</Badge>
                    <Badge variant="secondary">Comprehensive</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="bg-gray-50 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Get Started in 3 Simple Steps
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 px-4 sm:px-0">
                Begin your preparation journey today and land your dream AI role.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <Card className="text-center bg-white shadow-lg">
                <CardContent className="p-8">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">1. Import Your Plan</h3>
                  <p className="text-gray-600 mb-6">
                    Upload your study Excel file or use our default comprehensive plan to get started.
                  </p>
                  <Link href="/import">
                    <Button variant="outline" className="w-full">
                      Import Data
                      <FileText className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="text-center bg-white shadow-lg">
                <CardContent className="p-8">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">2. Follow Your Schedule</h3>
                  <p className="text-gray-600 mb-6">
                    View daily tasks, track progress, and follow the structured timeline for optimal preparation.
                  </p>
                  <Link href="/today">
                    <Button variant="outline" className="w-full">
                      View Today's Plan
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="text-center bg-white shadow-lg">
                <CardContent className="p-8">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">3. Track Progress</h3>
                  <p className="text-gray-600 mb-6">
                    Monitor your performance, analyze weak areas, and optimize your preparation strategy.
                  </p>
                  <Link href="/analytics">
                    <Button variant="outline" className="w-full">
                      View Analytics
                      <BarChart3 className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Explore Key Features
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 px-4 sm:px-0">
              Jump into any section of the platform to start your preparation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            <Link href="/playbooks">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-white border-purple-200">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Interactive Playbooks</h3>
                  <p className="text-sm text-gray-600">Master LLM concepts with step-by-step guides</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/problems">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-white border-green-200">
                <CardContent className="p-6 text-center">
                  <Code className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Practice Problems</h3>
                  <p className="text-sm text-gray-600">Solve categorized coding and ML problems</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/mocks">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-white border-blue-200">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Mock Interviews</h3>
                  <p className="text-sm text-gray-600">Practice and track interview performance</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/calendar">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-orange-50 to-white border-orange-200">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Study Calendar</h3>
                  <p className="text-sm text-gray-600">Visualize your preparation timeline</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/search">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-red-50 to-white border-red-200">
                <CardContent className="p-6 text-center">
                  <Search className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Smart Search</h3>
                  <p className="text-sm text-gray-600">Find any content across the platform</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Progress Analytics</h3>
                  <p className="text-sm text-gray-600">Track your preparation insights</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Ace Your LLM Interview?
            </h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100 px-4 sm:px-0">
              Join thousands of engineers who have successfully prepared with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <Link href="/today">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto px-6 sm:px-8 py-3">
                  Start Preparing Now
                  <Lightbulb className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/import">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 sm:px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600">
                  Import Your Data
                  <Upload className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
