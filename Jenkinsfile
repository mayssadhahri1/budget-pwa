// Pipeline CI/CD : qualité -> build Docker -> scan Trivy -> smoke test -> push Docker Hub
pipeline {
    agent any

    environment {
        IMAGE_NAME = 'mayssadhahri1/budget-pwa'
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }

    options {
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Qualité') {
            // Vérification des types et tests dans un conteneur Node
            agent {
                docker { image 'node:22-alpine'; reuseNode true }
            }
            steps {
                sh 'npm install --no-audit --no-fund'
                sh 'npm run typecheck'
                sh 'npm test'
            }
        }

        stage('Build image') {
            steps {
                sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG -t $IMAGE_NAME:latest .'
            }
        }

        stage('Scan Trivy') {
            steps {
                sh '''
                  docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                    aquasec/trivy:latest image --exit-code 1 --severity CRITICAL \
                    --ignore-unfixed $IMAGE_NAME:$IMAGE_TAG
                '''
            }
        }

        stage('Smoke test') {
            steps {
                sh '''
                  docker rm -f budget-smoke || true
                  docker run -d --name budget-smoke -p 8099:80 $IMAGE_NAME:$IMAGE_TAG
                  for i in $(seq 1 10); do
                    curl -fs http://localhost:8099/healthz && curl -fs http://localhost:8099/ | grep -q "Mon Budget" && exit 0
                    sleep 2
                  done
                  echo "Le conteneur ne répond pas" && exit 1
                '''
            }
            post {
                always { sh 'docker rm -f budget-smoke || true' }
            }
        }

        stage('Push Docker Hub') {
            when { branch 'main' }
            steps {
                // Identifiants enregistrés dans Jenkins sous l'id "dockerhub-credentials"
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials',
                                                  usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                    sh 'echo $DH_PASS | docker login -u $DH_USER --password-stdin'
                    sh 'docker push $IMAGE_NAME:$IMAGE_TAG && docker push $IMAGE_NAME:latest'
                    sh 'docker logout'
                }
            }
        }
    }

    post {
        success { echo "Image ${env.IMAGE_NAME}:${env.IMAGE_TAG} prête" }
        failure { echo 'Le pipeline a échoué, voir les logs ci-dessus.' }
    }
}
