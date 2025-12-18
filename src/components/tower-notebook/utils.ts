// src/components/tower-notebook/utils.ts

/**
 * Unicode-safe base64 encoding function
 */
export const encodeToBase64 = (str: string): string => {
  try {
    // First encode to UTF-8 bytes, then to base64
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    // Fallback: encode each character individually
    return btoa(str.split('').map(char => {
      const code = char.charCodeAt(0);
      return code > 255 ? '?' : char;
    }).join(''));
  }
};

/**
 * Get default output title based on type
 */
export const getOutputTitle = (type: string): string => {
  switch (type) {
    case 'study-guide': return 'Study Guide';
    case 'faq': return 'FAQ';
    case 'timeline': return 'Growth Timeline';
    case 'audio': return 'Audio Overview';
    case 'report': return 'Report';
    case 'visualization': return 'Visualization';
    default: return 'Generated Content';
  }
};

/**
 * Generate timeline content
 */
export const generateTimelineContent = (title: string): string => {
  return `# ${title}

## Growth Timeline Overview

### Week 1-2: Germination Phase
- Seeds sprout and develop first leaves
- Root system begins to establish
- Monitor moisture levels carefully
- Expected growth: 1-2 inches

### Week 3-4: Vegetative Growth
- Rapid leaf development and stem growth
- Plants establish strong root systems
- Monitor pH levels (5.5-6.5 optimal)
- Expected growth: 3-6 inches

### Week 5-6: Flowering Phase
- First flowers appear
- Pollination begins
- Monitor nutrient levels closely
- Expected growth: 6-12 inches

### Week 7-8: Harvest Ready
- Fruits mature and ready for harvest
- Monitor for optimal ripeness
- Prepare for harvest timing
- Expected growth: 12+ inches

## Key Monitoring Points
- Daily pH checks
- Weekly EC monitoring
- Visual inspection for pests
- Growth rate tracking
- Harvest timing optimization

## Success Indicators
- Healthy green foliage
- Strong root development
- Consistent growth rate
- No pest or disease issues
- Optimal harvest timing`;
};

/**
 * Generate study guide content
 */
export const generateStudyGuideContent = (title: string): string => {
  return `# ${title}

## Tower Care Basics

### Essential Daily Tasks
1. **pH Monitoring**
   - Check pH levels daily
   - Optimal range: 5.5-6.5
   - Adjust with pH up/down solutions

2. **Visual Inspection**
   - Look for pest damage
   - Check plant health
   - Monitor growth progress

### Weekly Maintenance
1. **EC Level Testing**
   - Measure electrical conductivity
   - Optimal range: 1.2-2.0 mS/cm
   - Adjust nutrient concentration

2. **System Cleaning**
   - Clean growing medium
   - Check water circulation
   - Inspect pump function

### Monthly Tasks
1. **Deep System Clean**
   - Complete system flush
   - Replace growing medium
   - Sanitize all components

2. **Plant Rotation**
   - Plan next crop cycle
   - Order seeds/plants
   - Prepare growing schedule

## Troubleshooting Guide
- **Yellow leaves**: Check nutrient levels
- **Slow growth**: Verify pH and EC
- **Pest issues**: Implement IPM strategies
- **Root problems**: Check water quality`;
};

/**
 * Generate FAQ content
 */
export const generateFAQContent = (title: string): string => {
  return `# ${title}

## Frequently Asked Questions

### General Tower Care
**Q: How often should I check the pH?**
A: Check pH levels daily for optimal plant health. The ideal range is 5.5-6.5.

**Q: What's the ideal temperature for my tower?**
A: Maintain 65-75°F (18-24°C) for best growth results.

**Q: How much light do my plants need?**
A: Provide 14-16 hours of light daily for optimal growth.

### Nutrient Management
**Q: When should I change the nutrient solution?**
A: Change every 2-3 weeks or when EC levels drop significantly.

**Q: What EC level should I maintain?**
A: Keep EC between 1.2-2.0 mS/cm for most plants.

**Q: How do I know if my plants need more nutrients?**
A: Look for yellowing leaves, slow growth, or weak stems.

### Plant Health
**Q: What should I do if I see pests?**
A: Identify the pest type and implement appropriate IPM strategies.

**Q: How can I prevent diseases?**
A: Maintain clean systems, proper air circulation, and avoid overwatering.

**Q: When is the best time to harvest?**
A: Harvest when fruits are fully mature and at peak ripeness.`;
};

/**
 * Generate report content
 */
export const generateReportContent = (title: string): string => {
  return `# ${title}

## Tower Performance Report

### Growth Metrics
- **Average Growth Rate**: +15% week over week
- **Plant Health Score**: 92%
- **Harvest Efficiency**: 85%
- **System Uptime**: 98%

### Key Achievements
- Consistent pH maintenance
- Zero pest outbreaks
- Optimal harvest timing
- Efficient nutrient usage

### Areas for Improvement
- Increase harvest frequency
- Optimize nutrient timing
- Enhance growth monitoring
- Improve yield consistency

### Recommendations
1. Continue current pH management
2. Increase monitoring frequency
3. Consider plant variety expansion
4. Implement advanced tracking

### Next Steps
- Plan next crop cycle
- Review growth data trends
- Optimize system settings
- Prepare for scaling up`;
};
