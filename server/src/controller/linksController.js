import getDeviceInfo from "../../utilities/linksUtility.js";
import Links from "../model/Links.js";
import Clicks from "../model/Clicks.js";
import User from '../model/Users.js'
import axios from "axios";

const linksController = {
  create: async (request, response) => {
    const { campaignTitle, originalUrl, category } = request.body;
    try {
      const user = await User.findById({_id: request.user.id});
      if(user.credits< 1){
        return response.status(400).json({
          code: 'INSUFFICIENT_FUNDS',
          message: 'insufficient funds'
        })
      }
      const link = new Links({
        campaignTitle: campaignTitle,
        originalUrl: originalUrl,
        category: category,
        user: request.user.role === 'admin' ? request.user.id : request.user.adminId,
      });

      await link.save();
      response.status(200).json({
        data: { id: link._id },
        message: 'Link created'
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: 'Internal server error for link create' });
    }
  },

  getAll: async (request, response) => {
    try {
      const userId = request.user.role === 'admin' ? request.user.id : request.user.adminId;
      const links = await Links.find({ user: userId }).sort({ createdAt: -1 });
      return response.json({ data: links });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  },

  getById: async (request, response) => {
    try {
      const linkId = request.params.id;
      if (!linkId) {
        return response.status(401).json({ error: 'Link id is required' });
      }

      const link = await Links.findById(linkId);
      if (!link) {
        return response.status(404).json({ error: 'Link does not exist with the given id' });
      }
      const userId = request.user.role === 'admin' ? request.user.id : request.user.adminId;
      if (link.user.toString() !== userId) {
        return response.status(403).json({ error: 'Unauthorized access' });
      }

      response.json({ data: link });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (request, response) => {
    try {
      const linkId = request.params.id;
      if (!linkId) {
        return response.status(401).json({ error: 'Link id is required' });
      }

      let link = await Links.findById(linkId);
      if (!link) {
        return response.status(404).json({ error: 'Link does not exist with the given id' });
      }

      const userId = request.user.role === 'admin' ? request.user.id : request.user.adminId;
      if (link.user.toString() !== userId) {
        return response.status(403).json({ error: 'Unauthorized access' });
      }

      const { campaignTitle, originalUrl, category } = request.body;
      link = await Links.findByIdAndUpdate(linkId, {
        campaignTitle: campaignTitle,
        originalUrl: originalUrl,
        category: category
      }, { new: true });
      response.json({ data: link });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  },

  delete: async (request, response) => {
    const linkId = request.params.id;
    try {
      if (!linkId) {
        return response.status(401).json({ error: 'Link id is required' });
      }

      let link = await Links.findById(linkId);
      if (!link) {
        return response.status(404).json({ error: 'Link does not exist with the given id' });
      }

      const userId = request.user.role === 'admin' ? request.user.id : request.user.adminId;
      if (link.user.toString() !== userId) {
        return response.status(403).json({ error: 'Unauthorized access' });
      }

      await link.deleteOne();
      response.json({ message: 'Link deleted' });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  },

  redirect: async (request, response) => {
    try {
      const linkId = request.params.id;
      if (!linkId) {
        return response.status(401).json({ error: 'Link id is required' });
      }

      let link = await Links.findById(linkId);
      if (!link) {
        return response.status(404).json({ error: 'Link does not exist with the given id' });
      }

      const isDevelopment = process.env.NODE_ENV === 'development';
      const ipAddress = isDevelopment ?
        '8.8.8.8' :
        request.headers['x-forwarded-for'] || request.socket.remoteAddress;

      const geoResponse = await axios.get(`http://ip-api.com/json/${ipAddress}/`);
      const { city, country, region, lat, lon, isp } = geoResponse.data;

      const userAgent = request.headers['user-agent'] || 'unknown';
      const { deviceType, browser } = getDeviceInfo(userAgent);

      const referrer = request.get('Referrer') || null;

      await Clicks.create({
        linkId: link._id,
        ip: ipAddress,
        city: city,
        country: country,
        region: region,
        latitude: lat,
        longitude: lon,
        userAgent: userAgent,
        isp: isp,
        device: deviceType,
        browser: browser,
        referrer: referrer,
        createdAt: new Date(),
      });


      link.clickCount += 1;
      await link.save();

      response.redirect(link.originalUrl);
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: 'Internal server error for redirect' });
    }
  },

  analytics: async (request, response) => {
    try {
      const { linkId, from, to } = request.query;

      const link = await Links.findById({_id: linkId});

      if (!link) {
        return response.status(404).json({
          error: 'Link not found'
        })
      }

      const userId = request.user.role === 'admin' ? request.user.id : request.user.adminId;

      if (link.user.toString() !== userId) {
        return response.status(403).json({
          error: 'Unauthorized access'
        });
      }

      const query = {
        linkId: linkId,
      };

      if (from && to) {
        query.clickedAt = { $gte: new Date(from), $lte: new Date(to) };
      }

      const data = await Clicks.find(query).sort({ clickedAt: -1 });
      response.json(data);

    } catch (error) {
      console.log(error);
      response.status(500).json({
        message: 'Internal Server Error for analytics'
      })
    }
  }
};

export default linksController;