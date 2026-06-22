import api from '../lib/api';

const registrationService = {
  /** GET /api/registrations/my — ambil data pendaftaran milik peserta */
  getMyRegistration: async () => {
    const { data } = await api.get('/registrations/my');
    return data.data || data;
  },

  /** POST /api/registrations — buat draft baru */
  createRegistration: async (dto) => {
    const { data } = await api.post('/registrations', dto);
    return data.data || data;
  },

  /** PATCH /api/registrations/:id — update draft */
  updateRegistration: async (id, dto) => {
    const { data } = await api.patch(`/registrations/${id}`, dto);
    return data.data || data;
  },

  /** POST /api/registrations/:id/submit — final submit */
  submitRegistration: async (id) => {
    const { data } = await api.post(`/registrations/${id}/submit`);
    return data.data || data;
  },
};

export default registrationService;
