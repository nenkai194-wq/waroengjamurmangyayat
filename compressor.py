"""
Waroeng Jamur Mang Yayat - Media Compression Engine
Kompresi otomatis foto dan video secara on-the-fly saat diunggah (upload)
untuk menghemat kapasitas penyimpanan (storage) dan mempercepat loading web.
"""

import os
import io
import shutil
import subprocess
from PIL import Image

# Cari executable ffmpeg jika tersedia
FFMPEG_EXE = None
try:
    import imageio_ffmpeg
    FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    pass

if not FFMPEG_EXE:
    # Cek di PATH sistem
    ffmpeg_in_path = shutil.which('ffmpeg')
    if ffmpeg_in_path:
        FFMPEG_EXE = ffmpeg_in_path

def compress_image_data(image_bytes, output_path, max_dim=1600, quality=78):
    """
    Mengompres data byte foto secara otomatis:
    - Resize cerdas jika dimensi > max_dim
    - Format JPG: quality=78, progressive=True, optimize=True
    - Format PNG: jika RGBA, quantize 256 warna (FastOctree) untuk transparansi super ringan
    """
    orig_size = len(image_bytes)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    im = Image.open(io.BytesIO(image_bytes))
    w, h = im.size
    ext = os.path.splitext(output_path)[1].lower()

    # Resize jika melebihi batas resolusi wajar
    if max(w, h) > max_dim:
        scale = max_dim / max(w, h)
        im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)

    temp_path = output_path + '.tmp'
    try:
        if ext in ['.jpg', '.jpeg']:
            if im.mode in ('RGBA', 'P'):
                im = im.convert('RGB')
            im.save(temp_path, 'JPEG', quality=quality, optimize=True, progressive=True)
        elif ext == '.png':
            if im.mode == 'RGBA':
                im_q = im.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
                im_q.save(temp_path, 'PNG', optimize=True)
            else:
                im.save(temp_path, 'PNG', optimize=True, compress_level=9)
        elif ext == '.webp':
            im.save(temp_path, 'WEBP', quality=quality, method=6)
        else:
            # Format lainnya simpan langsung
            with open(temp_path, 'wb') as f:
                f.write(image_bytes)

        comp_size = os.path.getsize(temp_path)
        # Jika hasil kompresi lebih kecil, gunakan hasil kompresi
        if comp_size < orig_size:
            shutil.move(temp_path, output_path)
            final_size = comp_size
        else:
            # Jika tidak lebih kecil, simpan file asli
            if os.path.exists(temp_path):
                os.remove(temp_path)
            with open(output_path, 'wb') as f:
                f.write(image_bytes)
            final_size = orig_size

        saved_percent = round(100.0 * (orig_size - final_size) / orig_size, 1) if orig_size > 0 else 0.0
        return {
            'success': True,
            'orig_size': orig_size,
            'compressed_size': final_size,
            'saved_percent': max(0.0, saved_percent),
            'path': output_path
        }
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        # Fallback simpan langsung
        with open(output_path, 'wb') as f:
            f.write(image_bytes)
        return {
            'success': True,
            'orig_size': orig_size,
            'compressed_size': orig_size,
            'saved_percent': 0.0,
            'path': output_path,
            'note': f'Fallback original saved: {e}'
        }

def compress_video_data(video_bytes, output_path, crf=28):
    """
    Mengompres data video secara otomatis menggunakan ffmpeg:
    - Codec H.264 web-compatible
    - Skala resolusi max 720p (-2:720)
    - Audio AAC 96k
    - Faststart streaming flag
    """
    orig_size = len(video_bytes)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    temp_raw = output_path + '.raw.tmp'
    temp_comp = output_path + '.comp.mp4'

    with open(temp_raw, 'wb') as f:
        f.write(video_bytes)

    if not FFMPEG_EXE:
        shutil.move(temp_raw, output_path)
        return {
            'success': True,
            'orig_size': orig_size,
            'compressed_size': orig_size,
            'saved_percent': 0.0,
            'path': output_path,
            'note': 'ffmpeg not found, saved uncompressed'
        }

    cmd = [
        FFMPEG_EXE, '-y',
        '-i', temp_raw,
        '-vf', 'scale=-2:720',
        '-c:v', 'libx264',
        '-crf', str(crf),
        '-preset', 'fast',
        '-c:a', 'aac',
        '-b:a', '96k',
        '-movflags', '+faststart',
        temp_comp
    ]

    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if os.path.exists(temp_comp):
            comp_size = os.path.getsize(temp_comp)
            if comp_size < orig_size:
                shutil.move(temp_comp, output_path)
                final_size = comp_size
            else:
                shutil.move(temp_raw, output_path)
                final_size = orig_size
                if os.path.exists(temp_comp):
                    os.remove(temp_comp)
        else:
            shutil.move(temp_raw, output_path)
            final_size = orig_size

        if os.path.exists(temp_raw):
            os.remove(temp_raw)

        saved_percent = round(100.0 * (orig_size - final_size) / orig_size, 1) if orig_size > 0 else 0.0
        return {
            'success': True,
            'orig_size': orig_size,
            'compressed_size': final_size,
            'saved_percent': max(0.0, saved_percent),
            'path': output_path
        }
    except Exception as e:
        if os.path.exists(temp_comp):
            os.remove(temp_comp)
        if os.path.exists(temp_raw):
            shutil.move(temp_raw, output_path)
        return {
            'success': True,
            'orig_size': orig_size,
            'compressed_size': orig_size,
            'saved_percent': 0.0,
            'path': output_path,
            'note': f'Video fallback saved: {e}'
        }
