import api from '../lib/api';

const registrationService = {
  /** GET /api/registrations/my — ambil semua pendaftaran milik peserta */
  getMyRegistration: async () => {
    const { data } = await api.get('/registrations/my');
    const result = data.data ?? data;
    // Normalisasi: selalu return array (handle BE lama yg return single object)
    if (Array.isArray(result)) return result;
    if (result && result.id) return [result];
    return [];
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

  /** POST /api/registrations/upload-photo — upload foto (multipart/form-data) */
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/registrations/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data || data;
  },

  /** DELETE /api/registrations/upload-photo — hapus foto dari server */
  deletePhoto: async (generatedName) => {
    const { data } = await api.delete('/registrations/upload-photo', {
      data: { generatedName },
    });
    return data.data || data;
  },
};

export default registrationService;
