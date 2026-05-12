const Issue = require("../models/issues");
const catchAsync = require("../utils/catchAsync");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

async function forwardGeocode(address) {
    try {
        const response = await geocodingClient.forwardGeocode({
            query: address,
            limit: 5,
            language: ['en']
        }).send();

        if (response && response.body && response.body.features.length > 0) {
            const features = response.body.features;
            return features.map(feature => ({
                formatted_address: feature.place_name,
                coordinates: {
                    lng: feature.center[0],
                    lat: feature.center[1]
                },
                place_type: feature.place_type,
                relevance: feature.relevance,
                context: feature.context || []
            }));
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('Mapbox forward geocoding error:', error);
        throw error;
    }
}

module.exports.forwardGeocode = catchAsync(async (req, res, next) => {
    const { address } = req.body;
    
    if (!address || address.trim() === '') {
        return res.status(400).json({ error: 'Address is required' });
    }

    const results = await forwardGeocode(address);
    res.json({ results });
});

module.exports.searchIssuesByLocation = catchAsync(async (req, res, next) => {
    const { address, radius = 5 } = req.body; // radius in kilometers
    
    if (!address || address.trim() === '') {
        return res.status(400).json({ error: 'Address is required' });
    }

    const geocodeResults = await forwardGeocode(address);
    
    if (!geocodeResults || geocodeResults.length === 0) {
        return res.json({ issues: [], message: 'Location not found' });
    }

    const primaryLocation = geocodeResults[0];
    const { lat, lng } = primaryLocation.coordinates;

    const issues = await Issue.find({
        'location.lat': {
            $gte: lat - (radius / 111),
            $lte: lat + (radius / 111)
        },
        'location.long': {
            $gte: lng - (radius / (111 * Math.cos(lat * Math.PI / 180))),
            $lte: lng + (radius / (111 * Math.cos(lat * Math.PI / 180)))
        }
    })
    .populate('user', 'username')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({
        issues,
        searchLocation: primaryLocation,
        totalFound: issues.length,
        searchRadius: radius
    });
});

module.exports.getMapData = catchAsync(async (req, res, next) => {
    const issues = await Issue.find({})
      .populate("user", "username")
      .select('title description category priority status location address createdAt _id image');
    
    const issuesWithLocation = issues.filter(issue => 
      issue.location && 
      issue.location.lat && 
      issue.location.long &&
      !isNaN(issue.location.lat) && 
      !isNaN(issue.location.long)
    );

    const mapData = issuesWithLocation.map(issue => ({
      id: issue._id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      priority: issue.priority,
      status: issue.status,
      address: issue.address,
      coordinates: [issue.location.long, issue.location.lat],
      createdAt: issue.createdAt,
      reportedBy: issue.user ? issue.user.username : 'Deleted User',
      imageUrl: issue.image ? issue.image.url : null
    }));

    res.json({
      success: true,
      issues: mapData,
      total: mapData.length
    });
});
