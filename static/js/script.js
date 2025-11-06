document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('movieForm');
    const storyInput = document.getElementById('story');
    const additionalFields = document.getElementById('additionalFields');
    const submitBtn = document.getElementById('submitBtn');
    const errorMessages = document.getElementById('errorMessages');
    const successMessage = document.getElementById('successMessage');
    const predictionsResults = document.getElementById('predictionsResults');
    const analyzeAnotherBtn = document.getElementById('analyzeAnother');

    let fieldsShown = false;

    // Auto-expand textarea
    storyInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';

        // Show additional fields when user starts typing
        if (!fieldsShown && this.value.trim().length > 0) {
            showAdditionalFields();
            fieldsShown = true;
        }
    });

    function showAdditionalFields() {
        additionalFields.classList.add('visible');
        
        // Smooth scroll to show the rest of the form
        setTimeout(() => {
            additionalFields.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
    }

    function validateForm() {
        const errors = [];
        const MAX_BUDGET = 10000000000; // 10 billion
        
        const title = document.getElementById('title').value.trim();
        const story = storyInput.value.trim();
        const year = document.getElementById('year').value;
        const genres = document.querySelectorAll('input[name="genres"]:checked');
        const budget = document.getElementById('budget').value.trim();

        // Title validation
        if (!title) {
            errors.push('Title is required');
        } else if (title.length < 2) {
            errors.push('Title must be at least 2 characters long');
        } else if (title.length > 200) {
            errors.push('Title cannot exceed 200 characters');
        }

        // Story validation
        if (!story) {
            errors.push('Movie story is required');
        } else if (story.length < 50) {
            errors.push('Story must be at least 50 characters long (currently ' + story.length + ' characters)');
        } else if (story.length > 10000) {
            errors.push('Story cannot exceed 10,000 characters');
        }

        // Year validation
        if (!year) {
            errors.push('Release year is required');
        } else {
            const yearNum = parseInt(year);
            const currentYear = new Date().getFullYear();
            if (isNaN(yearNum) || yearNum < 1880 || yearNum > currentYear) {
                errors.push('Please select a valid release year between 1880 and ' + currentYear);
            }
        }

        // Genre validation
        if (genres.length === 0) {
            errors.push('Please select at least one genre');
        } else if (genres.length > 10) {
            errors.push('You can select a maximum of 10 genres');
        }

        // Budget validation
        if (budget) {
            const budgetNum = parseFloat(budget);
            if (isNaN(budgetNum)) {
                errors.push('Budget must be a valid number');
            } else if (budgetNum <= 0) {
                errors.push('Budget must be greater than 0');
            } else if (budgetNum > MAX_BUDGET) {
                errors.push('Budget cannot exceed 10 billion');
            }
        }

        return errors;
    }

    function showErrors(errors) {
        errorMessages.innerHTML = '<ul>' + 
            errors.map(err => '<li>' + escapeHtml(err) + '</li>').join('') + 
            '</ul>';
        errorMessages.classList.add('show');
        
        // Scroll to error messages
        errorMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showSuccess(message) {
        successMessage.textContent = '✓ ' + message;
        successMessage.classList.add('show');
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 5000);
    }

    function hideMessages() {
        errorMessages.classList.remove('show');
        successMessage.classList.remove('show');
        predictionsResults.classList.remove('show');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatCurrency(value) {
        return '$' + value.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    function formatPercent(value) {
        return value.toFixed(1) + '%';
    }

    function showPredictions(predictions) {
        // Update probability (0-1 to percentage)
        const probabilityPercent = (predictions.success_probability * 100).toFixed(1);
        document.getElementById('pred-probability').textContent = probabilityPercent + '%';
        document.getElementById('pred-category').textContent = predictions.success_category;
        
        // Update box office revenue
        document.getElementById('pred-revenue').textContent = formatCurrency(predictions.box_office_revenue);
        
        // Update ROI
        document.getElementById('pred-roi').textContent = formatPercent(predictions.roi_percentage);
        const profitText = predictions.profit >= 0 ? 
            'Profit: ' + formatCurrency(predictions.profit) : 
            'Loss: ' + formatCurrency(Math.abs(predictions.profit));
        document.getElementById('pred-profit').textContent = profitText;
        
        // Update critical rating
        document.getElementById('pred-rating').textContent = predictions.critical_rating + '/10';
        
        // Update genre success score (0-1 to percentage)
        const genreScorePercent = (predictions.genre_success_score * 100).toFixed(1);
        document.getElementById('pred-genre-score').textContent = genreScorePercent + '%';
        
        // Show predictions section
        predictionsResults.classList.add('show');
    }

    // Analyze Another button
    analyzeAnotherBtn.addEventListener('click', function() {
        // Reset form
        form.reset();
        storyInput.style.height = 'auto';
        additionalFields.style.display = 'block';
        additionalFields.classList.remove('visible');
        fieldsShown = false;
        
        // Hide predictions
        predictionsResults.classList.remove('show');
        
        // Clear messages
        hideMessages();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Character counter for story (optional feature)
    storyInput.addEventListener('input', function() {
        const length = this.value.length;
        const hint = document.querySelector('.input-hint');
        
        if (length > 0 && length < 50) {
            hint.textContent = 'Tell us about your movie story (' + length + '/50 characters minimum)';
            hint.style.color = '#ef4444';
        } else if (length >= 50 && length <= 10000) {
            hint.textContent = 'Great! Keep going... (' + length + '/10,000 characters)';
            hint.style.color = '#10b981';
        } else if (length > 10000) {
            hint.textContent = 'Maximum character limit reached (' + length + '/10,000 characters)';
            hint.style.color = '#ef4444';
        } else {
            hint.textContent = 'Tell us about your movie story (minimum 50 characters)';
            hint.style.color = '#9ca3af';
        }
    });

    // Add smooth transitions for form inputs
    const inputs = document.querySelectorAll('.input-field');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.01)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
});

