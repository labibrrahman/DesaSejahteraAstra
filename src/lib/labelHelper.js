export const getLabelsForDsaType = (dsaType) => {
  const isIndividual = String(dsaType).toLowerCase() === 'individu';
  if (isIndividual) {
    return {
      namaKetua: 'Nama Local Champion',
      noHpKetua: 'No.HP Local Champion',
      namaKetuaPj: 'Nama Local Champion',
      ketuaKelompok: 'Local Champion',
      nomorHpKetuaKelompok: 'Nomor HP Local Champion'
    };
  }
  return {
    namaKetua: 'Nama Ketua Kelompok',
    noHpKetua: 'No.HP Ketua Kelompok',
    namaKetuaPj: 'Nama Ketua Kelompok / PJ',
    ketuaKelompok: 'Ketua Kelompok',
    nomorHpKetuaKelompok: 'Nomor HP Ketua Kelompok'
  };
};

/**
 * Helper untuk mengambil tipe DSA dari list program peserta di Admin list
 * pembacaan selalu merujuk pada category.dsaType
 */
export const getDsaTypeFromPrograms = (programs) => {
  if (!Array.isArray(programs) || programs.length === 0) return 'Kelompok';
  // Jika ada salah satu program bertipe Individu pada category.dsaType
  const hasIndividual = programs.some(
    p => p.category?.dsaType?.toLowerCase() === 'individu'
  );
  return hasIndividual ? 'Individu' : 'Kelompok';
};
