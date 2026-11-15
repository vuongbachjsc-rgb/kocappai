import os
from flask import Flask, render_template, request, jsonify, url_for
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['OUTPUT_FOLDER'] = 'outputs'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        face_img = request.files.get('faceImage')
        prod_img = request.files.get('productImage')
        batch_count = int(request.form.get('batch_count', 5))
        
        if not face_img or not prod_img:
            return jsonify({'success': False, 'error': 'Thiếu file hình ảnh đầu vào!'})
        
        face_filename = secure_filename(face_img.filename)
        prod_filename = secure_filename(prod_img.filename)
        
        face_img.save(os.path.join(app.config['UPLOAD_FOLDER'], face_filename))
        prod_img.save(os.path.join(app.config['UPLOAD_FOLDER'], prod_filename))
        
        generated_videos = []
        sample_video_url = "https://www.w3schools.com/html/mov_bbb.mp4"
        
        for i in range(min(batch_count, 10)):
            generated_videos.append(sample_video_url)
            
        return jsonify({
            'success': True,
            'count': batch_count,
            'videos': generated_videos
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
