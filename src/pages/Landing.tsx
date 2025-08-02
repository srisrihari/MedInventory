
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain,
  TrendingUp,
  ShoppingCart,
  Settings,
  Users,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  Star,
  Building2,
  Stethoscope,
  ArrowRight,
  ChevronRight,
  Zap,
  Target,
  Award,
  Globe
} from "lucide-react";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, email, message });
    // Handle form submission - in a real app, this would send the data to a server
  };
  
  // Animation variants for smooth transitions
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Navigation */}
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b shadow-sm"
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Stethoscope className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MedInventory
              </span>
              <div className="text-xs text-gray-500 -mt-1">by StarBytes</div>
            </div>
          </motion.div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#problem" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Problem
            </a>
            <a href="#solution" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Solution
            </a>
            <a href="#market" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Market
            </a>
            <a href="#team" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Team
            </a>
          </nav>
          
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="outline" size="sm" className="hover:bg-blue-50">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
          <motion.div 
            className="absolute inset-0"
            animate={{ 
              background: [
                "radial-gradient(600px circle at 0% 0%, rgba(59, 130, 246, 0.15), transparent 50%)",
                "radial-gradient(600px circle at 100% 0%, rgba(147, 51, 234, 0.15), transparent 50%)",
                "radial-gradient(600px circle at 100% 100%, rgba(59, 130, 246, 0.15), transparent 50%)",
                "radial-gradient(600px circle at 0% 100%, rgba(147, 51, 234, 0.15), transparent 50%)",
                "radial-gradient(600px circle at 0% 0%, rgba(59, 130, 246, 0.15), transparent 50%)"
              ]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-6xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            <motion.div 
              className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-800 dark:text-blue-200 mb-8"
              variants={fadeInUp}
            >
              <Award className="w-4 h-4 mr-2" />
              Transforming Healthcare Supply Chains with AI
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8"
              variants={fadeInUp}
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Optimizing Healthcare
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">Value Chains</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Streamlining Supply Chains for Better Patient Care through AI-Powered Supply Chain Optimization. 
              <span className="font-semibold text-blue-600"> Reduce costs by 20%, improve forecasting accuracy by 30%.</span>
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
              variants={fadeInUp}
            >
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto font-semibold px-10 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Start Free Trial
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <a href="#problem">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold px-10 py-4 text-lg border-2 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200">
                  See the Problem
                  <ChevronRight className="ml-3 h-5 w-5" />
                </Button>
              </a>
            </motion.div>

            {/* Stats Row */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              variants={staggerChildren}
            >
              <motion.div 
                className="text-center"
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl font-bold text-blue-600 mb-2">₹815.62M</div>
                <div className="text-gray-600 dark:text-gray-400">Indian Healthcare ERP Market by 2025</div>
              </motion.div>
              <motion.div 
                className="text-center"
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl font-bold text-purple-600 mb-2">20%</div>
                <div className="text-gray-600 dark:text-gray-400">Reduction in Operational Costs</div>
              </motion.div>
              <motion.div 
                className="text-center"
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl font-bold text-green-600 mb-2">30%</div>
                <div className="text-gray-600 dark:text-gray-400">Improvement in Forecasting Accuracy</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Problem Statement Section */}
      <section id="problem" className="py-20 bg-gradient-to-b from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-950">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Critical Supply Chain <span className="text-red-600">Inefficiencies</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Mid-sized hospitals are struggling with massive operational inefficiencies that directly impact patient care and financial sustainability.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Problem Stats */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <IndianRupee className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      20% Extra Operational Costs
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Manual procurement processes are causing significant cost overruns in mid-sized hospitals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      30%+ Forecasting Errors
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Fragmented systems result in inaccurate demand predictions leading to stock shortages.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Extended Supplier Wait Times
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Disconnected digital tools lead to suboptimal pricing and delayed procurement cycles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Delayed Maintenance & Expiry Tracking
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Ineffective scheduling causes increased downtime and high waste from expired inventory.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Case Study */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white dark:bg-gray-800 border-l-4 border-l-red-500 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <Building2 className="h-8 w-8 text-red-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Real Case Study</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                        🏥 Tier 2 Hospital, Karjat, Greater Mumbai
                      </h4>
                      <p className="text-red-700 dark:text-red-400">
                        Equipment shortages due to inaccurate forecasting led to delayed surgeries and increased patient dissatisfaction.
                      </p>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
                        🏥 Shivalik Hospital, Faridabad
                      </h4>
                      <p className="text-orange-700 dark:text-orange-400">
                        Manual procurement processes resulted in 25% cost overruns and frequent stock-outs of critical medications.
                      </p>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3">The Cost of Inaction:</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                        <li className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          Delayed patient treatments
                        </li>
                        <li className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          Increased operational costs
                        </li>
                        <li className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          Loss of patient trust
                        </li>
                        <li className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          Reduced hospital profitability
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-20 bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-950 dark:to-blue-950">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              AI-Powered <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Supply Chain Optimization</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our comprehensive solution addresses every inefficiency in your healthcare supply chain with cutting-edge AI technology.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Solution 1 */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI-Driven Demand Forecasting
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Utilizes predictive analytics to accurately anticipate inventory needs, reducing wastage and ensuring essential supplies are always available.
              </p>
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-semibold">Reduces wastage by up to 30%</span>
              </div>
            </motion.div>

            {/* Solution 2 */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Automated Supplier Bidding
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Streamlines procurement by automating the supplier selection process, leading to cost reductions and improved supplier relationships.
              </p>
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-semibold">Reduces procurement costs by 20%</span>
              </div>
            </motion.div>

            {/* Solution 3 */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                  <Settings className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Predictive Maintenance
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Employs AI to monitor equipment health and predict maintenance needs, preventing unexpected failures and extending equipment lifespan.
              </p>
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-semibold">Reduces equipment downtime by 40%</span>
              </div>
            </motion.div>

            {/* Solution 4 */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-4">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Real-Time Data Integration
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Seamlessly connects with existing ERP systems, IoT devices, and supplier networks to provide a unified, real-time view of the supply chain.
              </p>
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-semibold">Enhances decision-making by 50%</span>
              </div>
            </motion.div>
          </div>

          {/* Tech Stack */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Built on Robust Tech Infrastructure
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
                <span className="font-medium">AWS Cloud</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded"></div>
                <span className="font-medium">Java Backend</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
                <span className="font-medium">React Frontend</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded"></div>
                <span className="font-medium">Python AI/ML</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
                <span className="font-medium">PostgreSQL</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded"></div>
                <span className="font-medium">Kafka</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Market Opportunity Section */}
      <section id="market" className="py-20 bg-gradient-to-b from-green-50 to-blue-50 dark:from-green-950 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Massive <span className="text-green-600">Market Opportunity</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The healthcare ERP market is experiencing unprecedented growth, creating a perfect window for AI-powered innovation.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* Global Market */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Global Market</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">₹5.7L Cr → ₹9.9L Cr</div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">2022 to 2030</p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <span className="text-blue-800 dark:text-blue-300 font-semibold">6.2% CAGR</span>
              </div>
            </motion.div>

            {/* Indian Market */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Indian Market</h3>
              <div className="text-4xl font-bold text-green-600 mb-2">₹815.62M</div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">by 2025</p>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <span className="text-green-800 dark:text-green-300 font-semibold">9.14% CAGR</span>
              </div>
            </motion.div>

            {/* Our Opportunity */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Star className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our SOM</h3>
              <div className="text-4xl font-bold text-purple-600 mb-2">₹81.56M</div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">within 3 years</p>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <span className="text-purple-800 dark:text-purple-300 font-semibold">10% achievable</span>
              </div>
            </motion.div>
          </div>

          {/* Why Now */}
          <motion.div 
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Why Now?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Post-COVID Digitization Push</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Government incentives like Ayushman Bharat Digital Mission (ABDM) aim to modernize hospital infrastructure.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AI Adoption in Cost Efficiency</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">AI-driven automation is projected to save hospitals ₹8.3L Cr annually globally (McKinsey).</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Regulatory Compliance & Transparency</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">The National Digital Health Blueprint (NDHB) encourages tech adoption in healthcare logistics.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Hospitals Under Pressure</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Rising costs and fragmented systems make AI-based efficiency solutions a necessity.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team StarBytes Section */}
      <section id="team" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Meet Team <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">StarBytes</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              A powerhouse team combining deep healthcare expertise with cutting-edge AI/ML capabilities to revolutionize medical supply chains.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Team Member 1 */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  SP
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Shivam Pratapwar</h3>
                <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">Founder & Business Strategist</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Experienced in business strategy and enterprise-grade applications. Led strategic initiatives and business development for healthcare technology solutions.
                </p>
              </div>
            </motion.div>

            {/* Team Member 2 */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  SS
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Srihari Srinivas</h3>
                <p className="text-purple-600 dark:text-purple-400 font-semibold mb-3">Full-Stack AI Engineer</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Strong background in ML model development, backend systems, and real-world applications. Built recommendation systems, NLP solutions, and expert in full-stack development and AI/ML engineering.
                </p>
              </div>
            </motion.div>

            {/* Team Member 3 */}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  DA
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Deepika Ambade</h3>
                <p className="text-teal-600 dark:text-teal-400 font-semibold mb-3">MedTech & Product Strategy</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Blends technical expertise in MedTech with strong team and product management skills. Experienced in managing product life cycles from ideation to deployment, specializing in healthcare technology strategy.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Team Strengths */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Why StarBytes?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <Award className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Deep AI/ML & Healthcare Expertise</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Domain-specific expertise in hospital supply chain optimization with proven AI capabilities.</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Early Traction & Industry Backing</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Initial pilot discussions with mid-sized hospitals and recognition at health-tech events.</p>
              </div>
              <div className="text-center">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cost-Effective & Tailored Solution</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Unlike expensive enterprise ERPs, we provide a plug-and-play, AI-powered solution for mid-sized hospitals.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Transform Your Hospital's Supply Chain?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join the AI revolution in healthcare. Reduce costs by 20%, improve forecasting by 30%, and enhance patient care with MedInventory.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto font-semibold px-10 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg">
                  Start Free Trial
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold px-10 py-4 text-lg border-2 border-white text-white hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200">
                  Login to Dashboard
                  <ChevronRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Revenue Projections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">₹4 Cr</div>
                <div className="text-blue-100">Year 2 Revenue Target</div>
                <div className="text-sm text-blue-200 mt-1">200 hospitals × ₹20K</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">₹20 Cr</div>
                <div className="text-blue-100">Year 5 Revenue Target</div>
                <div className="text-sm text-blue-200 mt-1">1,000 hospitals × ₹30K</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">₹81.56M</div>
                <div className="text-blue-100">Market Opportunity</div>
                <div className="text-sm text-blue-200 mt-1">Within 3 years</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Stethoscope className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    MedInventory
                  </span>
                  <div className="text-sm text-gray-400 -mt-1">by Team StarBytes</div>
                </div>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Transforming healthcare supply chains with AI-powered optimization. 
                Reduce costs, improve forecasting, and enhance patient care.
              </p>
              <div className="text-sm text-gray-400">
                <div>📧 hello@medinventory.ai</div>
                <div>📱 +91 9876543210</div>
                <div>🏢 Bangalore, India</div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#problem" className="block text-gray-300 hover:text-blue-400 transition-colors">
                  Problem
                </a>
                <a href="#solution" className="block text-gray-300 hover:text-blue-400 transition-colors">
                  Solution
                </a>
                <a href="#market" className="block text-gray-300 hover:text-blue-400 transition-colors">
                  Market
                </a>
                <a href="#team" className="block text-gray-300 hover:text-blue-400 transition-colors">
                  Team
                </a>
              </div>
            </div>

            {/* Get Started */}
            <div>
              <h3 className="text-white font-semibold mb-4">Get Started</h3>
              <div className="space-y-2">
                <Link to="/signup" className="block text-gray-300 hover:text-blue-400 transition-colors">
                  Sign Up
                </Link>
                <Link to="/login" className="block text-gray-300 hover:text-blue-400 transition-colors">
                  Login
                </Link>
                <a href="#contact" className="block text-gray-300 hover:text-blue-400 transition-colors">
                  Request Demo
                </a>
                <a href="#contact" className="block text-gray-300 hover:text-blue-400 transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} MedInventory by Team StarBytes. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a>
              </div>
            </div>
            
            {/* Funding & Recognition */}
            <div className="mt-6 pt-6 border-t border-gray-800 text-center">
              <div className="text-gray-400 text-sm mb-3">🏆 Recognized at Health-Tech Events | 💼 Early Pilot Discussions with Mid-Sized Hospitals</div>
              <div className="text-gray-500 text-xs">
                Presented at IIM Bangalore | Targeting ₹815.62M Indian Healthcare ERP Market
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
