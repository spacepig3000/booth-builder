import React, { useState } from 'react';
import { Download, User } from 'lucide-react';

const BoothBuilder = () => {
  const [currentStep, setCurrentStep] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [user, setUser] = useState({ name: 'Demo User', email: 'demo@example.com' });
  const [config, setConfig] = useState({
    // Dimensions (inches)
    overallLength: 48,
    overallHeight: 42,
    overallDepth: 24,
    seatHeight: 18,
    seatDepth: 18,
    backAngle: 15,
    toeKickHeight: 4,
    toeKickDepth: 3,
    numberOfSegments: 1,
    cushionThickness: 3,
    
    // Materials
    woodType: 'maple',
    fabricType: 'commercial-vinyl',
    woodFinish: 'natural'
  });

  const templates = [
    {
      id: 'straight-full-upholstered',
      name: 'Straight - Fully Upholstered',
      description: 'Classic straight booth with upholstered seat and back',
      basePrice: 145, // per linear foot
      image: '🪑'
    },
    {
      id: 'straight-wood-back',
      name: 'Straight - Wood Back', 
      description: 'Straight booth with wood back panel and upholstered seat',
      basePrice: 165,
      image: '🏛️'
    },
    {
      id: 'curved-full-upholstered',
      name: 'Curved - Fully Upholstered',
      description: 'Curved booth with upholstered seat and back',
      basePrice: 185,
      image: '🌙'
    }
  ];

  const materialOptions = {
    wood: [
      { value: 'maple', label: 'Maple', multiplier: 1.0 },
      { value: 'oak', label: 'Red Oak', multiplier: 1.1 },
      { value: 'walnut', label: 'Walnut', multiplier: 1.4 },
      { value: 'spec-to-follow', label: 'See Spec to Follow', multiplier: 1.0 }
    ],
    fabric: [
      { value: 'commercial-vinyl', label: 'Commercial Vinyl', multiplier: 1.0 },
      { value: 'fabric-grade-3', label: 'Fabric Grade 3', multiplier: 1.2 },
      { value: 'fabric-grade-5', label: 'Fabric Grade 5', multiplier: 1.5 },
      { value: 'spec-to-follow', label: 'See Spec to Follow', multiplier: 1.0 }
    ],
    finish: [
      { value: 'natural', label: 'Natural/Clear', multiplier: 1.0 },
      { value: 'stain', label: 'Stain', multiplier: 1.05 },
      { value: 'paint', label: 'Paint', multiplier: 1.1 }
    ]
  };

  const calculatePrice = () => {
    if (!selectedTemplate) return 0;
    
    const linearFeet = config.overallLength / 12;
    const basePrice = selectedTemplate.basePrice * linearFeet;
    
    // Material multipliers
    const woodMult = materialOptions.wood.find(w => w.value === config.woodType)?.multiplier || 1.0;
    const fabricMult = materialOptions.fabric.find(f => f.value === config.fabricType)?.multiplier || 1.0;
    const finishMult = materialOptions.finish.find(f => f.value === config.woodFinish)?.multiplier || 1.0;
    
    // Complexity factors
    const segmentMult = 1 + (config.numberOfSegments - 1) * 0.15; // 15% per additional segment
    const heightMult = config.overallHeight > 48 ? 1.1 : 1.0; // 10% for tall backs
    
    return basePrice * woodMult * fabricMult * finishMult * segmentMult * heightMult;
  };

  const generateParameterFile = () => {
    const params = {
      // Template info
      template_id: selectedTemplate.id,
      template_name: selectedTemplate.name,
      
      // Customer info
      customer_name: user.name,
      customer_email: user.email,
      order_date: new Date().toISOString().split('T')[0],
      
      // Dimensions
      overall_length: config.overallLength,
      overall_height: config.overallHeight,
      overall_depth: config.overallDepth,
      seat_height: config.seatHeight,
      seat_depth: config.seatDepth,
      back_angle: config.backAngle,
      toe_kick_height: config.toeKickHeight,
      toe_kick_depth: config.toeKickDepth,
      number_of_segments: config.numberOfSegments,
      cushion_thickness: config.cushionThickness,
      
      // Materials
      wood_type: config.woodType,
      fabric_type: config.fabricType,
      wood_finish: config.woodFinish,
      
      // Pricing
      estimated_price: Math.round(calculatePrice()),
      linear_feet: (config.overallLength / 12).toFixed(2)
    };

    // Convert to formatted text file content
    let fileContent = "# Custom Booth Configuration\n";
    fileContent += "# Generated: " + new Date().toLocaleString() + "\n\n";
    
    Object.entries(params).forEach(([key, value]) => {
      fileContent += `${key}=${value}\n`;
    });

    return fileContent;
  };

  const downloadParameterFile = () => {
    const content = generateParameterFile();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booth_config_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validateDimensions = () => {
    const errors = [];
    if (config.overallLength < 24 || config.overallLength > 144) {
      errors.push("Overall length must be between 24\" and 144\"");
    }
    if (config.seatHeight < 16 || config.seatHeight > 20) {
      errors.push("Seat height should be between 16\" and 20\" for ergonomics");
    }
    if (config.seatDepth < 16 || config.seatDepth > 22) {
      errors.push("Seat depth should be between 16\" and 22\"");
    }
    return errors;
  };

  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Select Booth Template</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {templates.map(template => (
          <div 
            key={template.id}
            onClick={() => setSelectedTemplate(template)}
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
              selectedTemplate?.id === template.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-4xl mb-3 text-center">{template.image}</div>
            <h3 className="font-bold text-lg mb-2">{template.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{template.description}</p>
            <p className="text-lg font-semibold text-green-600">
              ${template.basePrice}/linear ft
            </p>
          </div>
        ))}
      </div>
      {selectedTemplate && (
        <button 
          onClick={() => setCurrentStep('configure')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Configure This Booth →
        </button>
      )}
    </div>
  );

  const renderConfiguration = () => {
    const errors = validateDimensions();
    
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setCurrentStep('template')}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Templates
          </button>
          <h2 className="text-2xl font-bold">Configure: {selectedTemplate.name}</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Dimensions */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Dimensions (inches)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Overall Length</label>
                  <input 
                    type="number" 
                    value={config.overallLength}
                    onChange={(e) => setConfig({...config, overallLength: Number(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Overall Height</label>
                  <input 
                    type="number" 
                    value={config.overallHeight}
                    onChange={(e) => setConfig({...config, overallHeight: Number(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Overall Depth</label>
                  <input 
                    type="number" 
                    value={config.overallDepth}
                    onChange={(e) => setConfig({...config, overallDepth: Number(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Seat Height</label>
                  <input 
                    type="number" 
                    value={config.seatHeight}
                    onChange={(e) => setConfig({...config, seatHeight: Number(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Seat Depth</label>
                  <input 
                    type="number" 
                    value={config.seatDepth}
                    onChange={(e) => setConfig({...config, seatDepth: Number(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Back Angle (degrees)</label>
                  <input 
                    type="number" 
                    value={config.backAngle}
                    onChange={(e) => setConfig({...config, backAngle: Number(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Toe Kick Height</label>
                  <input 
                    type="number" 
                    value={config.toeKickHeight}
                    onChange={(e) => setConfig({...config, toeKickHeight: Number(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Segments</label>
                  <input 
                    type="number" 
                    value={config.numberOfSegments}
                    onChange={(e) => setConfig({...config, numberOfSegments: Number(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Materials */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Materials</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Wood Type</label>
                  <select 
                    value={config.woodType}
                    onChange={(e) => setConfig({...config, woodType: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    {materialOptions.wood.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Wood Finish</label>
                  <select 
                    value={config.woodFinish}
                    onChange={(e) => setConfig({...config, woodFinish: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    {materialOptions.finish.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Upholstery</label>
                  <select 
                    value={config.fabricType}
                    onChange={(e) => setConfig({...config, fabricType: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    {materialOptions.fabric.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Validation Errors:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {errors.map((error, i) => <li key={i}>• {error}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Summary Panel */}
          <div className="bg-gray-50 border rounded-lg p-6 h-fit">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Template:</span>
                <span className="font-medium">{selectedTemplate.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Length:</span>
                <span className="font-medium">{config.overallLength}"</span>
              </div>
              <div className="flex justify-between">
                <span>Linear Feet:</span>
                <span className="font-medium">{(config.overallLength / 12).toFixed(1)} LF</span>
              </div>
              <div className="flex justify-between">
                <span>Wood:</span>
                <span className="font-medium">
                  {materialOptions.wood.find(w => w.value === config.woodType)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Upholstery:</span>
                <span className="font-medium">
                  {materialOptions.fabric.find(f => f.value === config.fabricType)?.label}
                </span>
              </div>
              <hr className="my-3"/>
              <div className="flex justify-between text-lg font-bold">
                <span>Estimated Price:</span>
                <span className="text-green-600">${Math.round(calculatePrice()).toLocaleString()}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setCurrentStep('review')}
              disabled={errors.length > 0}
              className="w-full mt-6 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Review & Submit →
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderReview = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setCurrentStep('configure')}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Configuration
        </button>
        <h2 className="text-2xl font-bold">Review Your Order</h2>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Configuration Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Template:</strong> {selectedTemplate.name}</p>
              <p><strong>Dimensions:</strong> {config.overallLength}" × {config.overallHeight}" × {config.overallDepth}"</p>
              <p><strong>Seat:</strong> {config.seatHeight}" H × {config.seatDepth}" D</p>
              <p><strong>Back Angle:</strong> {config.backAngle}°</p>
              <p><strong>Segments:</strong> {config.numberOfSegments}</p>
              <p><strong>Wood:</strong> {materialOptions.wood.find(w => w.value === config.woodType)?.label}</p>
              <p><strong>Finish:</strong> {materialOptions.finish.find(f => f.value === config.woodFinish)?.label}</p>
              <p><strong>Upholstery:</strong> {materialOptions.fabric.find(f => f.value === config.fabricType)?.label}</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Pricing Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base ({(config.overallLength / 12).toFixed(1)} LF @ ${selectedTemplate.basePrice}):</span>
                <span>${Math.round(selectedTemplate.basePrice * (config.overallLength / 12))}</span>
              </div>
              <div className="flex justify-between">
                <span>Material adjustments:</span>
                <span>+{Math.round((calculatePrice() / (selectedTemplate.basePrice * (config.overallLength / 12)) - 1) * 100)}%</span>
              </div>
              <hr/>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-green-600">${Math.round(calculatePrice()).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium mb-2">Parameter File Preview:</h4>
        <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
          {generateParameterFile().split('\n').slice(0, 10).join('\n')}
          {generateParameterFile().split('\n').length > 10 && '\n... (truncated)'}
        </pre>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={downloadParameterFile}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          <Download size={20}/>
          Download Parameter File
        </button>
        <button 
          onClick={() => alert('In production, this would email the file to your shop and send confirmation to customer')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Submit Order
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Custom Booth Builder</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User size={16}/>
              <span>{user.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep === 'template' ? 'text-blue-600 font-medium' : currentStep !== 'template' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep === 'template' ? 'bg-blue-600 text-white' : currentStep !== 'template' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>1</div>
              Template
            </div>
            <div className="w-8 border-t border-gray-300"></div>
            <div className={`flex items-center gap-2 ${currentStep === 'configure' ? 'text-blue-600 font-medium' : currentStep === 'review' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep === 'configure' ? 'bg-blue-600 text-white' : currentStep === 'review' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>2</div>
              Configure
            </div>
            <div className="w-8 border-t border-gray-300"></div>
            <div className={`flex items-center gap-2 ${currentStep === 'review' ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>3</div>
              Review
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {currentStep === 'template' && renderTemplateSelection()}
        {currentStep === 'configure' && renderConfiguration()}
        {currentStep === 'review' && renderReview()}
      </div>
    </div>
  );
};

export default BoothBuilder;